import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'IntelliTrack - Fire-and-forget traffic analytics',
  description: 'IntelliTrack captures request-level traffic data in your Next.js app without blocking user requests. Self-hosted analytics you control.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
