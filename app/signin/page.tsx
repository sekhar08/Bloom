import Link from 'next/link';
import { redirect } from 'next/navigation';
import { LogIn } from 'lucide-react';
import { auth, signIn } from '@/auth';
import { hasDatabaseUrl } from '@/db';

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
    <main className="min-h-screen bg-slate-950 flex items-center justify-center px-6 py-12 text-slate-200">
      <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl shadow-slate-950/40">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-emerald-500">
            <LogIn className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Sign in to Bloom</h1>
          <p className="mt-2 text-sm text-slate-400">
            Authenticate before recording or opening your dashboard.
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
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-700 bg-white px-4 py-3 font-medium text-slate-950 transition hover:bg-slate-100"
            >
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
            </button>
          </form>

          <form
            action={async () => {
              'use server';
              await signIn('github', { redirectTo: callbackUrl });
            }}
          >
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 font-medium text-white transition hover:bg-slate-800"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
                <path d="M12 2a10 10 0 0 0-3.162 19.49c.5.092.683-.217.683-.482 0-.237-.01-1.022-.014-1.853-2.782.605-3.37-1.18-3.37-1.18-.455-1.157-1.11-1.465-1.11-1.465-.907-.62.069-.608.069-.608 1.002.07 1.53 1.03 1.53 1.03.892 1.529 2.341 1.087 2.91.831.091-.646.349-1.087.635-1.337-2.221-.253-4.556-1.11-4.556-4.944 0-1.092.39-1.986 1.029-2.686-.103-.253-.446-1.272.097-2.651 0 0 .84-.269 2.75 1.026A9.58 9.58 0 0 1 12 6.844a9.57 9.57 0 0 1 2.504.337c1.909-1.295 2.748-1.026 2.748-1.026.544 1.379.201 2.398.098 2.651.64.7 1.028 1.594 1.028 2.686 0 3.843-2.339 4.688-4.566 4.936.359.31.679.919.679 1.852 0 1.337-.012 2.415-.012 2.744 0 .267.18.579.688.481A10 10 0 0 0 12 2Z" />
              </svg>
              Continue with GitHub
            </button>
          </form>
        </div>

        {!isDatabaseConfigured ? (
          <p className="mt-6 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
            `DATABASE_URL` is missing. Configure Neon before attempting to sign in.
          </p>
        ) : null}

        <p className="mt-6 text-center text-xs text-slate-500">
          OAuth callbacks are handled by Auth.js at{' '}
          <Link href="/api/auth/signin" className="text-slate-400 hover:text-white">
            /api/auth/*
          </Link>
        </p>
      </div>
    </main>
  );
}
