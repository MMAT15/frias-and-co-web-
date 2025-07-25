import './globals.css'
import type { ReactNode } from 'react'
import Header from '@/components/ui/Header'
import Footer from '@/components/ui/Footer'
import { Poppins } from 'next/font/google'
import { DefaultSeo } from 'next-seo'
import seo from '../next-seo.config'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400','600'],
  variable: '--font-poppins'
})

export const metadata = {
  title: 'BERA Clothing',
  description: 'Shop online 24/7 \u2708\ufe0f Env\u00edos a todo el pa\u00eds'
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" className={poppins.variable}>
      <body className="font-sans bg-black text-white">
        <DefaultSeo {...seo} />
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
