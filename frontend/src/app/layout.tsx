import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { UIProvider } from '@/context/UIContext';
import { Analytics } from '@vercel/analytics/next';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'RailBlock AI — Indian Railways Block Planning Platform',
  description: 'AI-Powered Automatic Block Planning to Maximize Asset Availability',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#F1EDE3] text-[#344054] min-h-screen antialiased`}>
        <UIProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </UIProvider>
        <Analytics />
      </body>
    </html>
  );
}