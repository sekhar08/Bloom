'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavLinkProps {
  href: string;
  label: string;
}

export default function NavLink({ href, label }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={[
        'rounded-full px-4 py-1.5 text-sm font-medium transition-colors duration-200',
        isActive
          ? 'bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--border-accent)]'
          : 'text-[var(--foreground-soft)] hover:text-[var(--foreground)] hover:bg-[rgba(255,255,255,0.04)]',
      ].join(' ')}
    >
      {label}
    </Link>
  );
}
