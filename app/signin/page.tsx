import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { ArrowRight, LogIn, Sparkles } from 'lucide-react';
import { auth, signIn } from '@/auth';
import { hasDatabaseUrl } from '@/db';

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Authenticate with Bloom before recording or opening your dashboard.',
};

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const isDatabaseConfigured = hasDatabaseUrl();
  const session = isDatabaseConfigured ? await auth() : null;

  if (session?.user) {
    redirect('/');
  }

  const { callbackUrl = '/' } = await searchParams;

  return (
    <main id="main-content" className="min-h-screen">
      <div className="ui-shell flex min-h-screen items-center justify-center">
        <div className="relative grid w-full max-w-5xl gap-6 overflow-hidden rounded-[2.5rem] border border-[var(--border)] bg-[linear-gradient(145deg,rgba(255,255,255,0.72),rgba(249,243,235,0.92))] p-4 shadow-[0_30px_80px_rgba(24,36,52,0.08)] md:p-6 lg:grid-cols-[0.96fr_1.04fr]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(44,106,107,0.16),transparent_28%),radial-gradient(circle_at_78%_18%,rgba(93,126,166,0.14),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.16),transparent)]" />
          <div className="pointer-events-none absolute -left-10 top-24 h-40 w-40 rounded-full border border-white/50 bg-white/35 blur-2xl" />
          <div className="pointer-events-none absolute bottom-8 right-8 hidden h-56 w-56 rounded-full border border-white/45 bg-[rgba(44,106,107,0.08)] blur-3xl lg:block" />

          <section className="relative hidden rounded-[2rem] border border-[rgba(255,255,255,0.55)] bg-white/45 p-10 backdrop-blur lg:flex lg:flex-col lg:justify-between">
            <div>
              <span className="ui-badge">Bloom Access</span>
              <h1 className="mt-6 text-5xl font-semibold leading-[0.94] text-[var(--foreground)]">
                A calm place to record and review.
              </h1>
              <p className="mt-5 max-w-md text-base leading-7 text-[var(--foreground-soft)]">
                Sign in once and move straight into capture, playback, transcript, and summary.
              </p>
            </div>

            <div className="space-y-3 text-sm text-[var(--foreground-soft)]">
              <div className="flex items-center gap-3 rounded-full border border-[var(--border)] bg-white/60 px-4 py-3">
                <Sparkles className="h-4 w-4 text-[var(--accent)]" aria-hidden="true" />
                Clean recording flow
              </div>
              <div className="flex items-center gap-3 rounded-full border border-[var(--border)] bg-white/60 px-4 py-3">
                <Sparkles className="h-4 w-4 text-[var(--accent)]" aria-hidden="true" />
                AI transcript
              </div>
              <div className="flex items-center gap-3 rounded-full border border-[var(--border)] bg-white/60 px-4 py-3">
                <Sparkles className="h-4 w-4 text-[var(--accent)]" aria-hidden="true" />
                Automatic captions & timestamps
              </div>
            </div>
          </section>

          <section className="ui-panel-strong relative w-full rounded-[2rem] p-8 md:p-10">
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,var(--accent),#7cb3ad)] text-white shadow-[0_14px_30px_rgba(44,106,107,0.2)]">
                <LogIn className="h-6 w-6" aria-hidden="true" />
              </div>
              <h2 className="text-4xl font-semibold text-[var(--foreground)]">Sign In to Bloom</h2>
              <p className="mt-3 text-sm leading-6 text-[var(--foreground-soft)]">
                Enter the studio.
              </p>
            </div>

            <div className="space-y-3">
              <form
                action={async () => {
                  'use server';
                  await signIn('google', { redirectTo: callbackUrl });
                }}
              >
                <button
                  type="submit"
                  className="group flex w-full items-center justify-between rounded-[1.35rem] border border-[var(--border)] bg-white/80 px-5 py-4 text-left text-base font-semibold text-[var(--foreground)] shadow-[0_18px_40px_rgba(24,36,52,0.06)] hover:-translate-y-px hover:bg-white"
                >
                  <span className="flex items-center gap-3">
                    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                      <path
                        fill="#EA4335"
                        d="M12 10.2v3.96h5.51c-.24 1.27-.96 2.35-2.03 3.07l3.28 2.55c1.91-1.76 3.02-4.35 3.02-7.42 0-.72-.06-1.41-.19-2.08H12Z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 22c2.73 0 5.02-.9 6.69-2.44l-3.28-2.55c-.91.61-2.08.97-3.41.97-2.62 0-4.84-1.77-5.63-4.15H2.98v2.61A10.096 10.096 0 0 0 12 22Z"
                      />
                      <path
                        fill="#4A90E2"
                        d="M6.37 13.83a6.01 6.01 0 0 1 0-3.66V7.56H2.98a10.09 10.09 0 0 0 0 8.88l3.39-2.61Z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M12 6.02c1.49 0 2.83.51 3.89 1.5l2.92-2.92C17.01 2.95 14.72 2 12 2A10.096 10.096 0 0 0 2.98 7.56l3.39 2.61C7.16 7.79 9.38 6.02 12 6.02Z"
                      />
                    </svg>
                    Continue with Google
                  </span>
                  <ArrowRight className="h-4 w-4 text-[var(--foreground-soft)] transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </button>
              </form>
            </div>

            {!isDatabaseConfigured ? (
          <p className="mt-6 rounded-[1.25rem] border border-[rgba(138,90,35,0.24)] bg-[rgba(138,90,35,0.08)] px-4 py-3 text-sm text-[var(--warning)]">
                `DATABASE_URL` is missing. Configure Neon before attempting to sign in.
              </p>
            ) : null}
          </section>
        </div>
      </div>
    </main>
  );
}
