import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MARS Pivot — Career Resilience in the AI Era',
  description: 'Concrete answers and paths for navigating AI-driven job disruption. Human skills, pivots, and purpose.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
