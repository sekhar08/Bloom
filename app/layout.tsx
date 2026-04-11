import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Bloom',
  description: 'Authenticated screen recording dashboard powered by Mux.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col overflow-x-hidden text-[var(--foreground)]">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-[var(--foreground)]"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
