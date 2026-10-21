import type { Metadata } from 'next';
import { Geist, Geist_Mono, Libre_Baskerville } from 'next/font/google';
import './globals.css';
import { Shell } from '@/components/Shell';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin']
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin']
});

const libre = Libre_Baskerville({
  variable: '--font-serif',
  weight: ['400', '700'],
  subsets: ['latin']
});

export const metadata: Metadata = {
  title: {
    default: 'PlaceGraph — Cultural Intelligence for Commercial Space',
    template: '%s | PlaceGraph',
  },
  description:
    'PlaceGraph determines what commercial physical experience should exist in a location, for whom, and why — then translates that intelligence into an architectural concept. Powered by Qloo cultural-affinity data.',
  keywords: ['commercial design', 'cultural intelligence', 'architectural concept', 'hospitality', 'qloo', 'place strategy'],
  openGraph: {
    siteName: 'PlaceGraph',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} ${libre.variable} antialiased`}>
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
