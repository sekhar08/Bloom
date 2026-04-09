import Mux from '@mux/mux-node';
import type { JobStatus, RecordingStatus } from '@/db/schema';

export interface TranscriptLine {
  time: string;
  text: string;
}

function getMuxClient() {
  const tokenId = process.env.MUX_TOKEN_ID;
  const tokenSecret = process.env.MUX_TOKEN_SECRET;

  if (!tokenId || !tokenSecret) {
    throw new Error('MUX_TOKEN_ID and MUX_TOKEN_SECRET must be configured.');
  }

  return new Mux({
    tokenId,
    tokenSecret,
  });
}

export const mux = getMuxClient();

function formatVttTime(timestamp: string) {
  return timestamp.split('.')[0];
}

function parseTranscriptStatus(asset: Awaited<ReturnType<typeof mux.video.assets.retrieve>>): JobStatus {
  const textTrack = asset.tracks?.find(
    (track) => track.type === 'text' && track.text_type === 'subtitles',
  );

  if (!textTrack) {
    return asset.status === 'ready' ? 'preparing' : 'idle';
  }

  if (textTrack.status === 'ready') {
    return 'ready';
  }

  if (textTrack.status === 'errored') {
    return 'failed';
  }

  return 'preparing';
}

function parseRecordingStatus(asset: Awaited<ReturnType<typeof mux.video.assets.retrieve>>): RecordingStatus {
  if (asset.status === 'ready') {
    return 'ready';
  }

  if (asset.status === 'errored') {
    return 'failed';
  }

  return 'processing';
}

export async function createMuxUpload() {
  const upload = await mux.video.uploads.create({
    new_asset_settings: {
      playback_policy: ['public'],
      video_quality: 'plus',
      mp4_support: 'standard',
      input: [
        {
          generated_subtitles: [{ language_code: 'en', name: 'English (Auto)' }],
        },
      ],
    },
    cors_origin: '*',
  });

  return {
    id: upload.id,
    url: upload.url,
  };
}

export async function getUploadAssetId(uploadId: string) {
  const upload = await mux.video.uploads.retrieve(uploadId);
  return upload.asset_id ?? null;
}

export async function getAssetSnapshot(assetId: string) {
  const asset = await mux.video.assets.retrieve(assetId);

  return {
    muxAssetId: asset.id,
    playbackId: asset.playback_ids?.[0]?.id ?? null,
    status: parseRecordingStatus(asset),
    durationSeconds: asset.duration ? Math.round(asset.duration) : null,
    transcriptStatus: parseTranscriptStatus(asset),
    textTrackId:
      asset.tracks?.find((track) => track.type === 'text' && track.text_type === 'subtitles')?.id ?? null,
  };
}

export async function getTranscript(playbackId: string, textTrackId: string | null) {
  if (!textTrackId) {
    return [];
  }

  const response = await fetch(`https://stream.mux.com/${playbackId}/text/${textTrackId}.vtt`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    return [];
  }

  const vttText = await response.text();
  const blocks = vttText.split('\n\n');

  return blocks.reduce<TranscriptLine[]>((acc, block) => {
    const lines = block.split('\n');

    if (lines.length >= 2 && lines[1].includes('-->')) {
      const time = formatVttTime(lines[1].split(' --> ')[0]);
      const text = lines.slice(2).join(' ').trim();

      if (text) {
        acc.push({ time, text });
      }
    }

    return acc;
  }, []);
}

export async function generateMuxSummary(assetId: string) {
  const { getSummaryAndTags } = await import('@mux/ai/workflows');
  const result = await getSummaryAndTags(assetId, { tone: 'professional' });

  return {
    title: result.title,
    summary: result.description,
    tags: result.tags,
  };
}
