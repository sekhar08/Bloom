import type { Metadata } from 'next';
import ScreenRecorder from '@/components/ScreenRecorder';
import Link from 'next/link';
import { LayoutGrid, Sparkles, Video } from 'lucide-react';
import { signOut } from '@/auth';
import { requireSession } from '@/lib/session';
import SignOutButton from '@/components/SignOutButton';

export const metadata: Metadata = {
  title: 'Bloom Studio',
  description: 'Record a screen session and send it to Bloom for playback, transcript, and AI summary.',
};

export default async function Home() {
  const session = await requireSession();
  const identity = session.user.email ?? session.user.name ?? 'Signed in';

  return (
    <main id="main-content" className="min-h-screen">
      <div className="ui-shell flex min-h-screen flex-col gap-8 md:gap-10">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-3 rounded-full border border-[var(--border)] bg-white/70 px-4 py-2 text-sm text-[var(--foreground-soft)] shadow-sm">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[linear-gradient(135deg,var(--accent),#7cb3ad)] text-white shadow-[0_12px_24px_rgba(44,106,107,0.18)]">
                <Video className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="font-medium tracking-[0.18em] uppercase">Bloom Studio</span>
            </div>
            <h1 className="mt-7 max-w-5xl text-5xl font-semibold leading-[0.92] text-[var(--foreground)] md:text-7xl">
              Record beautifully.
              <br />
              Review instantly.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-[var(--foreground-soft)] md:text-lg">
              Screen capture, transcript, and summary in one quiet workspace.
            </p>
          </div>

          <div className="flex flex-col items-stretch gap-3 sm:flex-row lg:flex-col lg:items-end">
            <div className="rounded-full border border-[var(--border)] bg-white/70 px-4 py-2 text-sm text-[var(--foreground-soft)] shadow-sm">
              {identity}
            </div>
            <div className="flex flex-wrap justify-end gap-3">
              <Link href="/dashboard" className="ui-button-secondary">
                <LayoutGrid className="h-4 w-4" aria-hidden="true" />
                My Recordings
              </Link>
              <SignOutButton
                action={async () => {
                  'use server';
                  await signOut({ redirectTo: '/signin' });
                }}
              />
            </div>
          </div>
        </header>

        <section className="relative overflow-hidden rounded-[2.5rem] border border-[var(--border)] bg-[linear-gradient(145deg,rgba(255,255,255,0.72),rgba(249,243,235,0.9))] p-4 shadow-[0_30px_80px_rgba(24,36,52,0.08)] md:p-6">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(44,106,107,0.16),transparent_26%),radial-gradient(circle_at_80%_22%,rgba(93,126,166,0.14),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.18),transparent)]" />
          <div className="pointer-events-none absolute -left-14 top-24 h-40 w-40 rounded-full border border-white/50 bg-white/30 blur-2xl" />
          <div className="pointer-events-none absolute bottom-10 right-10 hidden h-56 w-56 rounded-full border border-white/45 bg-[rgba(44,106,107,0.08)] blur-3xl md:block" />

          <div className="relative grid gap-6 xl:grid-cols-[0.7fr_1.35fr] xl:items-start">
            <div className="flex h-full flex-col justify-between rounded-[2rem] border border-[rgba(255,255,255,0.55)] bg-white/45 p-6 backdrop-blur md:p-8">
              <div>
                <span className="ui-badge">Studio</span>
                <h2 className="mt-5 text-3xl font-semibold text-[var(--foreground)] md:text-4xl">
                  A slick capture surface with less noise.
                </h2>
              </div>

              <div className="mt-8 space-y-3 text-sm text-[var(--foreground-soft)]">
                <div className="flex items-center gap-3 rounded-full border border-[var(--border)] bg-white/55 px-4 py-3">
                  <Sparkles className="h-4 w-4 text-[var(--accent)]" aria-hidden="true" />
                  Fast capture
                </div>
                <div className="flex items-center gap-3 rounded-full border border-[var(--border)] bg-white/55 px-4 py-3">
                  <Sparkles className="h-4 w-4 text-[var(--accent)]" aria-hidden="true" />
                  Instant upload
                </div>
                <div className="flex items-center gap-3 rounded-full border border-[var(--border)] bg-white/55 px-4 py-3">
                  <Sparkles className="h-4 w-4 text-[var(--accent)]" aria-hidden="true" />
                  AI transcript
                </div>
              </div>
            </div>

            <ScreenRecorder />
          </div>
        </section>
      </div>
    </main>
  );
}
