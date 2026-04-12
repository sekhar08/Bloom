import type { Metadata } from 'next';
import ScreenRecorder from '@/components/ScreenRecorder';
import { Sparkles } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Bloom Studio',
  description: 'Record a screen session and send it to Bloom for playback, transcript, and AI summary.',
};

export default function Home() {
  return (
    <div className="ui-shell flex flex-col gap-10 md:gap-12">
      <header className="animate-fade-up max-w-3xl">
        <span className="ui-badge">Studio</span>
        <h1 className="mt-6 max-w-4xl text-5xl font-semibold leading-[0.92] text-[var(--foreground)] md:text-7xl">
          Record beautifully.
          <br />
          Review instantly.
        </h1>
        <p className="mt-5 max-w-xl text-base leading-7 text-[var(--foreground-soft)] md:text-lg">
          Screen capture, transcript, and summary in one quiet workspace.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-[var(--foreground-muted)]">
          <span className="flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-[var(--accent)]" aria-hidden="true" />
            Fast capture
          </span>
          <span aria-hidden="true" className="opacity-30">·</span>
          <span className="flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-[var(--accent)]" aria-hidden="true" />
            Instant upload
          </span>
          <span aria-hidden="true" className="opacity-30">·</span>
          <span className="flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-[var(--accent)]" aria-hidden="true" />
            AI transcript
          </span>
        </div>
      </header>

      <div className="animate-fade-up" style={{ animationDelay: '160ms' }}>
        <ScreenRecorder />
      </div>
    </div>
  );
}
