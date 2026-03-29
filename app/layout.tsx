import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'LXP Vertical Slice',
  description: 'Draft -> Review -> Publish -> Runtime proof',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
