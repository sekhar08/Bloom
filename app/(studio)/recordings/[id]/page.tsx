import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Download, Loader2 } from 'lucide-react';
import { getAssetStatus } from '@/app/actions';
import MuxPlayerWrapper from '@/components/MuxPlayerWrapper';
import ShareButton from '@/components/ShareButton';
import VideoStatusPoller from '@/components/VideoStatusPoller';
import VideoSummary from '@/components/VideoSummary';
import { formatDateTime } from '@/lib/format';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const details = await getAssetStatus(id);

  return {
    title: details ? details.recording.title : 'Recording',
    description: details
      ? `Review ${details.recording.title} with playback, transcript, and AI summary.`
      : 'Review a Bloom recording.',
  };
}

export default async function RecordingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const details = await getAssetStatus(id);

  if (!details) {
    notFound();
  }

  const { recording, transcript } = details;
  const isVideoReady = recording.status === 'ready' && Boolean(recording.playbackId);
  const isTranscriptReady = recording.transcriptStatus === 'ready';
  const downloadUrl = recording.playbackId
    ? `https://stream.mux.com/${recording.playbackId}/high.mp4?download=screen-recording.mp4`
    : null;

  return (
    <div className="ui-shell grid grid-cols-1 gap-8 xl:grid-cols-[1.45fr_0.8fr]">
      <div className="xl:col-span-2">
        <Link href="/dashboard" className="ui-button-ghost -ml-4">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to Library
        </Link>
      </div>

      <div className="animate-fade-up space-y-6">
        <section className="ui-panel-strong overflow-hidden rounded-[2rem] p-4 md:p-5">
          <div className="aspect-video overflow-hidden rounded-[1.5rem] border border-[var(--border)] bg-[rgba(0,0,0,0.4)] relative">
            {isVideoReady && recording.playbackId ? (
              <>
                <MuxPlayerWrapper playbackId={recording.playbackId} title={recording.title} />
                {!isTranscriptReady && <VideoStatusPoller recordingId={recording.id} isVideoReady={true} />}
              </>
            ) : (
              <VideoStatusPoller recordingId={recording.id} isVideoReady={false} />
            )}
          </div>
        </section>
      </div>

      <aside className="animate-fade-up space-y-6" style={{ animationDelay: '80ms' }}>
        <section className="ui-panel rounded-[2rem] p-6">
          <span className="ui-badge">Recording</span>
          <h1 className="mt-4 text-4xl font-semibold text-[var(--foreground)]">{recording.title}</h1>
          <p className="mt-3 text-sm leading-6 text-[var(--foreground-soft)]">
            {formatDateTime(recording.createdAt)} · {recording.status}
          </p>

          <div className="mt-6 flex flex-col gap-3">
            <ShareButton />
            {isVideoReady && downloadUrl ? (
              <a
                href={downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ui-button-secondary"
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                Download MP4
              </a>
            ) : null}
          </div>
        </section>

        <section className="ui-panel rounded-[2rem] p-6">
          <h2 className="text-2xl font-semibold text-[var(--foreground)]">AI Transcript</h2>

          <div className="mt-5 h-[520px] overflow-y-auto pr-2">
            {isTranscriptReady ? (
              transcript.length > 0 ? (
                <div className="space-y-3">
                  {transcript.map((line, index) => (
                    <div
                      key={`${line.time}-${index}`}
                      className="rounded-[1.2rem] border border-transparent px-3 py-3 hover:border-[var(--border)] hover:bg-[rgba(255,255,255,0.04)]"
                    >
                      <span className="block font-mono text-xs text-[var(--accent)]">{line.time}</span>
                      <p className="mt-1 text-sm leading-6 text-[var(--foreground-soft)]">{line.text}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm italic text-[var(--foreground-soft)]">No speech detected.</p>
              )
            ) : (
              <div className="flex h-40 flex-col items-center justify-center gap-3 text-[var(--foreground-soft)]">
                <Loader2 className="h-5 w-5 animate-spin text-[var(--accent)]" aria-hidden="true" />
                <p className="text-sm">
                  {recording.status === 'failed' ? 'Recording failed to process.' : 'Generating transcript…'}
                </p>
              </div>
            )}
          </div>
        </section>
      </aside>

      <div className="xl:col-span-2 animate-fade-up" style={{ animationDelay: '160ms' }}>
        {isVideoReady ? <VideoSummary recordingId={recording.id} /> : null}
      </div>
    </div>
  );
}
