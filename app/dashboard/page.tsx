import type { Metadata } from 'next';
import Link from 'next/link';
import { listVideos } from '@/app/actions';
import { ArrowLeft, Clock3 } from 'lucide-react';
import VideoThumbnail from '@/components/VideoThumbnail';
import { signOut } from '@/auth';
import { requireSession } from '@/lib/session';
import SignOutButton from '@/components/SignOutButton';
import { formatDateTime } from '@/lib/format';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Review uploaded recordings, processing status, and transcript progress.',
};

export default async function DashboardPage() {
  const session = await requireSession();
  const videos = await listVideos();
  const identity = session.user.email ?? session.user.name;

  return (
    <main id="main-content" className="min-h-screen">
      <div className="ui-shell">
        <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="ui-badge">Library</span>
            <h1 className="mt-4 text-5xl font-semibold text-[var(--foreground)]">My Recordings</h1>
            <p className="mt-3 text-sm leading-6 text-[var(--foreground-soft)]">{identity}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/" className="ui-button-secondary">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back to Recorder
            </Link>
            <SignOutButton
              action={async () => {
                'use server';
                await signOut({ redirectTo: '/signin' });
              }}
            />
          </div>
        </header>

        {videos.length === 0 ? (
          <section className="ui-panel mt-10 rounded-[2rem] px-8 py-20 text-center">
            <p className="text-lg font-medium text-[var(--foreground)]">No recordings yet.</p>
            <p className="mt-3 text-sm text-[var(--foreground-soft)]">
              Start a new capture to create your first Bloom review page.
            </p>
            <Link href="/" className="ui-button-primary mt-8">
              Create First Recording
            </Link>
          </section>
        ) : (
          <section className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {videos.map((video) => (
            <article
              key={video.id}
              className="ui-panel group overflow-hidden rounded-[1.85rem] hover:-translate-y-0.5 hover:border-[color:var(--border-strong)]"
            >
              <Link href={`/recordings/${video.id}`} className="block">
                <div className="relative aspect-video overflow-hidden bg-[rgba(29,39,51,0.06)]">
                {video.status === 'ready' && video.playbackId ? (
                  <VideoThumbnail playbackId={video.playbackId} />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-xs text-[var(--foreground-soft)]">
                    <Clock3 className="h-5 w-5" aria-hidden="true" />
                    {video.status === 'failed' ? 'Processing failed' : 'Processing…'}
                  </div>
                )}
                </div>
              
              <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <h2 className="min-w-0 text-2xl font-semibold text-[var(--foreground)]">
                    <span className="block truncate">{video.title}</span>
                  </h2>
                  <span className="ui-badge shrink-0">Recording</span>
                </div>
                <p className="mt-3 text-sm text-[var(--foreground-soft)]">{formatDateTime(video.createdAt)}</p>
                <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--foreground-soft)]">
                  {video.status} · transcript {video.transcriptStatus}
                </p>
              </div>
              </Link>
            </article>
          ))}
          </section>
        )}
      </div>
    </main>
  );
}
