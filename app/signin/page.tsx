import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { auth, signIn } from '@/auth';
import { hasDatabaseUrl } from '@/db';

export const metadata: Metadata = {
  title: 'Sign In — Bloom',
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
    <main id="main-content" className="relative min-h-screen overflow-hidden flex items-center justify-center">

      {/* ── Atmospheric background layers ── */}

      {/* Central amber spotlight */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-[520px] w-[800px] rounded-full blur-[120px]"
        style={{ background: 'radial-gradient(ellipse, rgba(212,168,67,0.09) 0%, transparent 70%)' }}
      />

      {/* Bottom sage glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 h-64 w-[600px] rounded-full blur-[100px]"
        style={{ background: 'radial-gradient(ellipse, rgba(127,176,144,0.07) 0%, transparent 70%)' }}
      />

      {/* Concentric ambient rings */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute rounded-full border border-[rgba(212,168,67,0.07)]"
        style={{ width: 560, height: 560, top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute rounded-full border border-[rgba(212,168,67,0.04)]"
        style={{ width: 820, height: 820, top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute rounded-full border border-[rgba(212,168,67,0.025)]"
        style={{ width: 1100, height: 1100, top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
      />

      {/* Corner accent glows */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full blur-[100px]"
        style={{ background: 'rgba(127,176,144,0.04)' }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full blur-[100px]"
        style={{ background: 'rgba(212,168,67,0.04)' }}
      />

      {/* ── Content ── */}
      <div className="relative z-10 w-full max-w-[400px] px-6">

        {/* Bloom wordmark */}
        <div className="animate-fade-up mb-12 text-center">
          <div className="relative inline-flex flex-col items-center gap-4">
            {/* Glow halo behind the dot */}
            <div className="relative">
              <span
                aria-hidden="true"
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8 rounded-full blur-lg"
                style={{ background: 'rgba(212,168,67,0.45)' }}
              />
              <span
                aria-hidden="true"
                className="relative h-3 w-3 rounded-full bg-[var(--accent)] animate-glow-pulse block"
              />
            </div>
            <span className="font-display text-[3.5rem] leading-none tracking-[-0.04em] text-[var(--foreground)]">
              Bloom
            </span>
          </div>
          <p className="mt-4 text-sm tracking-wide text-[var(--foreground-muted)]">
            Your screen recording studio
          </p>
        </div>

        {/* Sign-in card */}
        <div className="animate-fade-up" style={{ animationDelay: '120ms' }}>
          <div className="relative overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[var(--background-surface)] p-8 shadow-[var(--shadow-soft)]">

            {/* Amber hairline top accent */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-0 h-px"
              style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(212,168,67,0.45) 50%, transparent 100%)' }}
            />

            {/* Inner radial glow */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{ background: 'radial-gradient(ellipse at top, rgba(212,168,67,0.05) 0%, transparent 65%)' }}
            />

            <div className="relative">
              <h2 className="text-2xl font-semibold text-[var(--foreground)]">Welcome back</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--foreground-soft)]">
                Sign in to continue to your studio.
              </p>

              <div className="mt-8">
                <form
                  action={async () => {
                    'use server';
                    await signIn('google', { redirectTo: callbackUrl });
                  }}
                >
                  <button
                    type="submit"
                    className="group relative flex w-full items-center gap-4 overflow-hidden rounded-[1.25rem] border border-[var(--border-strong)] bg-[rgba(255,255,255,0.05)] px-5 py-4 text-sm font-semibold text-[var(--foreground)] hover:bg-[rgba(255,255,255,0.09)] hover:border-[rgba(232,240,235,0.22)] hover:-translate-y-px"
                  >
                    {/* Hover inner glow */}
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 rounded-[1.25rem] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                      style={{ background: 'radial-gradient(ellipse at center, rgba(212,168,67,0.06) 0%, transparent 70%)' }}
                    />

                    <span className="relative flex w-full items-center gap-4">
                      {/* Google logo */}
                      <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" aria-hidden="true">
                        <path fill="#EA4335" d="M12 10.2v3.96h5.51c-.24 1.27-.96 2.35-2.03 3.07l3.28 2.55c1.91-1.76 3.02-4.35 3.02-7.42 0-.72-.06-1.41-.19-2.08H12Z" />
                        <path fill="#34A853" d="M12 22c2.73 0 5.02-.9 6.69-2.44l-3.28-2.55c-.91.61-2.08.97-3.41.97-2.62 0-4.84-1.77-5.63-4.15H2.98v2.61A10.096 10.096 0 0 0 12 22Z" />
                        <path fill="#4A90E2" d="M6.37 13.83a6.01 6.01 0 0 1 0-3.66V7.56H2.98a10.09 10.09 0 0 0 0 8.88l3.39-2.61Z" />
                        <path fill="#FBBC05" d="M12 6.02c1.49 0 2.83.51 3.89 1.5l2.92-2.92C17.01 2.95 14.72 2 12 2A10.096 10.096 0 0 0 2.98 7.56l3.39 2.61C7.16 7.79 9.38 6.02 12 6.02Z" />
                      </svg>
                      <span className="flex-1 text-left">Continue with Google</span>
                      <ArrowRight
                        className="h-4 w-4 shrink-0 text-[var(--foreground-muted)] transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-[var(--foreground-soft)]"
                        aria-hidden="true"
                      />
                    </span>
                  </button>
                </form>
              </div>

              {!isDatabaseConfigured ? (
                <p className="mt-6 rounded-[1.25rem] border border-[rgba(200,136,58,0.24)] bg-[rgba(200,136,58,0.08)] px-4 py-3 text-sm text-[var(--warning)]">
                  `DATABASE_URL` is missing. Configure Neon before attempting to sign in.
                </p>
              ) : null}
            </div>
          </div>
        </div>

        {/* Footer hint */}
        <p
          className="animate-fade-up mt-8 text-center text-xs text-[var(--foreground-muted)]"
          style={{ animationDelay: '240ms' }}
        >
          No account needed — just a Google sign-in.
        </p>
      </div>
    </main>
  );
}
