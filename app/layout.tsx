import type { Metadata } from 'next';
import { Instrument_Sans, Instrument_Serif, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const instrumentSans = Instrument_Sans({
  subsets: ['latin'],
  variable: '--font-instrument-sans',
  display: 'swap',
});

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-instrument-serif',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Bloom',
  description: 'Screen recording studio with AI transcription and summaries.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const fontClasses = [
    instrumentSans.variable,
    instrumentSerif.variable,
    jetbrainsMono.variable,
  ].join(' ');

  return (
    <html lang="en" className={`h-full antialiased ${fontClasses}`}>
      <body className="min-h-full flex flex-col overflow-x-hidden text-[var(--foreground)]">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-[var(--background-strong)] focus:border focus:border-[var(--border-accent)] focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-[var(--foreground)]"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
