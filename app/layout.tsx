import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import { plPL } from '@clerk/localizations';
import './globals.css';

const inter = Inter({
  variable: '--font-sans',
  subsets: ['latin', 'latin-ext'],
});

export const metadata: Metadata = {
  title: 'PowerPlan — Trening Powerliftingowy',
  description: 'Planuj i śledź trening powerliftingowy z periodyzacją blokową',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider localization={plPL}>
      <html lang="pl" className={`${inter.variable} h-full antialiased`}>
        <body className="min-h-full flex flex-col font-sans">{children}</body>
      </html>
    </ClerkProvider>
  );
}
