import type { JobStatus, Recording, RecordingStatus, RecordingStore } from '@/lib/recording-store';

type MuxAssetSnapshot = {
  playbackId: string | null;
  status: RecordingStatus;
  durationSeconds: number | null;
  transcriptStatus: JobStatus;
};

type MuxApi = {
  createUpload(): Promise<{ id: string; url: string }>;
  retrieveUpload(uploadId: string): Promise<{ assetId: string | null }>;
  retrieveAsset(assetId: string): Promise<MuxAssetSnapshot>;
};

interface CreateRecordingsServiceOptions {
  store: RecordingStore;
  mux: MuxApi;
}

interface MuxWebhookEventData {
  id?: string;
  upload_id?: string;
  asset_id?: string;
  [key: string]: unknown;
}

export interface MuxWebhookEvent {
  type: string;
  data: MuxWebhookEventData;
}

async function applyAssetRefresh(
  store: RecordingStore,
  mux: MuxApi,
  recording: Recording,
  assetId: string,
) {
  const snapshot = await mux.retrieveAsset(assetId);

  return store.updateById(recording.id, {
    muxAssetId: assetId,
    playbackId: snapshot.playbackId,
    status: snapshot.status,
    durationSeconds: snapshot.durationSeconds,
    transcriptStatus: snapshot.transcriptStatus,
    errorCode: snapshot.status === 'failed' ? 'mux_asset_errored' : null,
  });
}

export function createRecordingsService(options: CreateRecordingsServiceOptions) {
  const { store, mux } = options;

  return {
    async applyMuxWebhookEvent(event: MuxWebhookEvent) {
      const eventData = event.data ?? {};
      const eventType = event.type;

      if (eventType.startsWith('video.upload')) {
        const uploadId = eventData.id ?? eventData.upload_id;

        if (!uploadId) {
          return null;
        }

        const recording = await store.findByUploadId(uploadId);

        if (!recording) {
          return null;
        }

        if (eventType === 'video.upload.asset_created' && eventData.asset_id) {
          return store.updateById(recording.id, {
            muxAssetId: eventData.asset_id,
            status: 'processing',
            transcriptStatus: 'preparing',
            errorCode: null,
          });
        }

        if (eventType === 'video.upload.errored' || eventType === 'video.upload.cancelled') {
          return store.updateById(recording.id, {
            status: 'failed',
            transcriptStatus: 'failed',
            summaryStatus: 'failed',
            errorCode: 'mux_upload_failed',
          });
        }

        return recording;
      }

      if (!eventType.startsWith('video.asset')) {
        return null;
      }

      const assetId = eventData.id;

      if (!assetId) {
        return null;
      }

      let recording = await store.findByAssetId(assetId);

      if (!recording && eventData.upload_id) {
        recording = await store.findByUploadId(eventData.upload_id);
      }

      if (!recording) {
        return null;
      }

      return applyAssetRefresh(store, mux, recording, assetId);
    },
  };
}
