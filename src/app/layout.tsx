
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { cn } from '@/lib/utils';
import { headers } from 'next/headers';


export const metadata: Metadata = {
  title: 'Sbirumon',
  description: 'A Pokemon-style battle simulator',
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // const pathname = headers().get('x-next-pathname') || '/';
  // const isMainMenu = pathname === '/' || pathname.startsWith('/?');
  
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="application-name" content="Sbirumon" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Sbirumon" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#222222" />
        
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />

        <link rel="preconnect" href="https://fonts.googleapis.com"/>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous"/>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;700&display=swap" rel="stylesheet"/>

        {/* Preload background images */}
        <link rel="preload" href="/sfondo.png" as="image" />
        <link rel="preload" href="/prateria.png" as="image" />
        <link rel="preload" href="/citta.png" as="image" />
        <link rel="preload" href="/palestre.png" as="image" />
        <link rel="preload" href="/covo.png" as="image" />
        <link rel="preload" href="/palestracombat.png" as="image" />
        <link rel="preload" href="/casa.png" as="image" />

      </head>
      <body className={"font-body antialiased overflow-hidden"} suppressHydrationWarning={true}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
