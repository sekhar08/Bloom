import { and, desc, eq } from 'drizzle-orm';
import { getDb, schema } from '@/db';
import { createMuxUpload, generateMuxSummary, getAssetSnapshot, getTranscript, getUploadAssetId } from '@/lib/mux';

type Recording = typeof schema.recordings.$inferSelect;

function now() {
  return new Date();
}

async function updateRecording(recordingId: string, patch: Partial<Recording>) {
  const db = getDb();
  const [updated] = await db
    .update(schema.recordings)
    .set({
      ...patch,
      updatedAt: now(),
    })
    .where(eq(schema.recordings.id, recordingId))
    .returning();

  return updated ?? null;
}

export async function createRecordingForUser(userId: string) {
  const db = getDb();
  const upload = await createMuxUpload();

  const [recording] = await db
    .insert(schema.recordings)
    .values({
      userId,
      title: 'Screen Recording',
      muxUploadId: upload.id,
      status: 'uploading',
      transcriptStatus: 'idle',
      summaryStatus: 'idle',
    })
    .returning();

  return {
    recording,
    upload,
  };
}

export async function listRecordingsForUser(userId: string) {
  const db = getDb();
  return db
    .select()
    .from(schema.recordings)
    .where(eq(schema.recordings.userId, userId))
    .orderBy(desc(schema.recordings.createdAt));
}

export async function getRecordingForUser(recordingId: string, userId: string) {
  const db = getDb();
  const [recording] = await db
    .select()
    .from(schema.recordings)
    .where(and(eq(schema.recordings.id, recordingId), eq(schema.recordings.userId, userId)))
    .limit(1);

  return recording ?? null;
}

export async function getRecordingForUserByPlaybackId(playbackId: string, userId: string) {
  const db = getDb();
  const [recording] = await db
    .select()
    .from(schema.recordings)
    .where(and(eq(schema.recordings.playbackId, playbackId), eq(schema.recordings.userId, userId)))
    .limit(1);

  return recording ?? null;
}

export async function syncRecordingWithMux(recording: Recording) {
  let current = recording;

  try {
    if (!current.muxAssetId) {
      const assetId = await getUploadAssetId(current.muxUploadId);

      if (!assetId) {
        return current;
      }

      current =
        (await updateRecording(current.id, {
          muxAssetId: assetId,
          status: 'processing',
          transcriptStatus: current.transcriptStatus === 'idle' ? 'preparing' : current.transcriptStatus,
          errorCode: null,
        })) ?? current;
    }

    if (!current.muxAssetId) {
      return current;
    }

    const snapshot = await getAssetSnapshot(current.muxAssetId);

    return (
      (await updateRecording(current.id, {
        muxAssetId: snapshot.muxAssetId,
        playbackId: snapshot.playbackId,
        status: snapshot.status,
        transcriptStatus: snapshot.transcriptStatus,
        durationSeconds: snapshot.durationSeconds,
        errorCode: snapshot.status === 'failed' ? 'mux_asset_errored' : null,
      })) ?? current
    );
  } catch (error) {
    console.error('Error syncing recording from Mux', error);
    return (
      (await updateRecording(current.id, {
        status: 'failed',
        transcriptStatus: current.transcriptStatus === 'ready' ? 'ready' : 'failed',
        errorCode: 'mux_sync_failed',
      })) ?? current
    );
  }
}

export async function getRecordingDetails(recordingId: string, userId: string) {
  const recording = await getRecordingForUser(recordingId, userId);

  if (!recording) {
    return null;
  }

  const synced = await syncRecordingWithMux(recording);

  let transcript = [] as Awaited<ReturnType<typeof getTranscript>>;
  if (synced.playbackId && synced.muxAssetId && synced.transcriptStatus !== 'idle') {
    const snapshot = await getAssetSnapshot(synced.muxAssetId);
    transcript =
      synced.playbackId && snapshot.transcriptStatus === 'ready'
        ? await getTranscript(synced.playbackId, snapshot.textTrackId)
        : [];
  }

  return {
    recording: synced,
    transcript,
  };
}

export async function generateRecordingSummary(recordingId: string, userId: string) {
  const recording = await getRecordingForUser(recordingId, userId);

  if (!recording?.muxAssetId || recording.status !== 'ready') {
    return null;
  }

  await updateRecording(recording.id, {
    summaryStatus: 'preparing',
    errorCode: null,
  });

  try {
    const summary = await generateMuxSummary(recording.muxAssetId);
    await updateRecording(recording.id, {
      summaryStatus: 'ready',
    });
    return summary;
  } catch (error) {
    console.error('Error generating summary', error);
    await updateRecording(recording.id, {
      summaryStatus: 'failed',
      errorCode: 'mux_summary_failed',
    });
    return null;
  }
}
