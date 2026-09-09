import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'LeadFlow CRM',
  description: 'Client lead management system',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
