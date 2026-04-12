import Link from 'next/link';
import { LogOut } from 'lucide-react';
import NavLink from './NavLink';

interface NavProps {
  userEmail?: string | null;
  userName?: string | null;
  signOutAction: () => Promise<void>;
}

export default function Nav({ userEmail, userName, signOutAction }: NavProps) {
  const identity = userEmail ?? userName ?? 'Signed in';

  return (
    <nav
      aria-label="Main navigation"
      className="sticky top-0 z-50 flex h-14 items-center justify-between px-6 md:px-10 border-b border-[var(--border)] bg-[rgba(14,26,18,0.82)] backdrop-blur-xl"
    >
      <Link
        href="/"
        className="flex items-center gap-2.5 group"
        aria-label="Bloom home"
      >
        <span
          aria-hidden="true"
          className="h-2 w-2 rounded-full bg-[var(--accent)] animate-glow-pulse"
        />
        <span className="font-display text-xl leading-none text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors duration-200">
          Bloom
        </span>
      </Link>

      <div className="hidden md:flex items-center gap-1">
        <NavLink href="/" label="Studio" />
        <NavLink href="/dashboard" label="Library" />
      </div>

      <div className="flex items-center gap-3">
        <span className="hidden sm:block max-w-[200px] truncate text-xs text-[var(--foreground-muted)]">
          {identity}
        </span>
        <form action={signOutAction}>
          <button
            type="submit"
            className="ui-button-ghost py-1.5 px-3 text-xs gap-1.5"
            aria-label="Sign out"
          >
            <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </form>
      </div>
    </nav>
  );
}
