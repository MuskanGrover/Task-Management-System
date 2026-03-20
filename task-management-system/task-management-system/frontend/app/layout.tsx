import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Task Management System',
  description: 'Assessment implementation for Track A'
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
