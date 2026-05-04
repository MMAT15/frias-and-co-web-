import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ReactNode } from 'react';
import Link from 'next/link';
import DarkModeToggle from '../components/DarkModeToggle';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: {
    default: 'Viviana Varacca Boutique',
    template: '%s | Viviana Varacca Boutique'
  },
  description: 'Tienda online de indumentaria urbana.'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" className={inter.variable}>
      <body className="min-h-screen font-sans antialiased bg-white text-gray-900">
        <header className="border-b sticky top-0 bg-white z-50">
          <nav className="max-w-7xl mx-auto flex items-center justify-between p-4">
            <Link href="/" className="text-lg font-bold">VIVIANA</Link>
            <div className="flex items-center gap-4">
              <Link href="/products" className="text-sm">Catálogo</Link>
              <DarkModeToggle />
            </div>
          </nav>
        </header>
        {children}
        <footer className="border-t mt-10 p-4 text-center text-sm">
          &copy; {new Date().getFullYear()} Viviana Varacca Boutique.
        </footer>
        <script
          dangerouslySetInnerHTML={{
            __html: `if('serviceWorker' in navigator){window.addEventListener('load',()=>{navigator.serviceWorker.register('/service-worker.js');});}`
          }}
        />
      </body>
    </html>
  );
}
