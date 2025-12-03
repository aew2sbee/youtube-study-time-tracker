import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Study Time Tracker',
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <div className="fixed inset-0 w-[1920px] h-[1080px] overflow-hidden pointer-events-none from-slate-900 via-slate-800 to-slate-900">
        <div className="absolute bottom-0 left-0 w-[640px] h-[1080px] p-4 pointer-events-auto">
          <div className="bg-gray-300 backdrop-blur-md rounded-xl p-6 h-full border border-gray-900 shadow-2xl">
            <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>{children}</body>
          </div>
        </div>
      </div>
    </html>
  );
}
