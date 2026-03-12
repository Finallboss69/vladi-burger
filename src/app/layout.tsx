import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/layout/Providers';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Vladi.burger | Hamburguesas Artesanales',
  description: 'Las mejores hamburguesas artesanales. Pedí online, armá tu propia burger y disfrutá.',
  keywords: ['hamburguesas', 'artesanales', 'delivery', 'buenos aires'],
  manifest: '/manifest.json',
  themeColor: '#FF6B35',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Vladi.burger',
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
