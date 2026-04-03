import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

export type RecordingStatus = 'uploading' | 'processing' | 'ready' | 'failed';
export type JobStatus = 'idle' | 'preparing' | 'ready' | 'failed';

export interface Recording {
  id: string;
  title: string;
  muxUploadId: string;
  muxAssetId: string | null;
  playbackId: string | null;
  status: RecordingStatus;
  transcriptStatus: JobStatus;
  summaryStatus: JobStatus;
  errorCode: string | null;
  durationSeconds: number | null;
  createdAt: string;
  updatedAt: string;
}

interface RecordingStoreFile {
  recordings: Recording[];
}

type RecordingPatch = Partial<
  Omit<Recording, 'id' | 'muxUploadId' | 'createdAt' | 'updatedAt'>
>;

export interface RecordingStore {
  list(): Promise<Recording[]>;
  findByUploadId(uploadId: string): Promise<Recording | null>;
  findByAssetId(assetId: string): Promise<Recording | null>;
  updateById(id: string, patch: RecordingPatch): Promise<Recording | null>;
}

interface CreateRecordingStoreOptions {
  filePath: string;
}

function normalizeStoreFile(value: unknown): RecordingStoreFile {
  if (!value || typeof value !== 'object' || !Array.isArray((value as RecordingStoreFile).recordings)) {
    return { recordings: [] };
  }

  return value as RecordingStoreFile;
}

export async function createRecordingStore(
  options: CreateRecordingStoreOptions,
): Promise<RecordingStore> {
  const { filePath } = options;

  await mkdir(dirname(filePath), { recursive: true });

  try {
    await readFile(filePath, 'utf8');
  } catch {
    await writeFile(filePath, JSON.stringify({ recordings: [] }, null, 2), 'utf8');
  }

  let queue: Promise<unknown> = Promise.resolve();

  const withLock = async <T>(operation: () => Promise<T>): Promise<T> => {
    const next = queue.then(operation, operation);
    queue = next.then(
      () => undefined,
      () => undefined,
    );

    return next;
  };

  const readStore = async (): Promise<RecordingStoreFile> => {
    const content = await readFile(filePath, 'utf8');
    const parsed = JSON.parse(content) as unknown;
    return normalizeStoreFile(parsed);
  };

  const writeStore = async (store: RecordingStoreFile) => {
    await writeFile(filePath, `${JSON.stringify(store, null, 2)}\n`, 'utf8');
  };

  return {
    async list() {
      return withLock(async () => {
        const store = await readStore();
        return [...store.recordings];
      });
    },
    async findByUploadId(uploadId: string) {
      return withLock(async () => {
        const store = await readStore();
        return store.recordings.find((item) => item.muxUploadId === uploadId) ?? null;
      });
    },
    async findByAssetId(assetId: string) {
      return withLock(async () => {
        const store = await readStore();
        return store.recordings.find((item) => item.muxAssetId === assetId) ?? null;
      });
    },
    async updateById(id: string, patch: RecordingPatch) {
      return withLock(async () => {
        const store = await readStore();
        const index = store.recordings.findIndex((item) => item.id === id);

        if (index < 0) {
          return null;
        }

        const current = store.recordings[index];
        const next: Recording = {
          ...current,
          ...patch,
          updatedAt: new Date().toISOString(),
        };

        store.recordings[index] = next;
        await writeStore(store);

        return next;
      });
    },
  };
}
