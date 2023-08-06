import Link from 'next/link'
import './globals.css'
import { Rufina } from 'next/font/google'

const rufina = Rufina({
  weight: '400',
  subsets: ['latin']
})

export const metadata = {
  title: 'OMUSO',
  description:
    'A visionary project that aims to curate and offer an extensive collection of timeless literary.'
}

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${rufina.className} text-center min-h-screen`}>
        <header role="banner" className="p-5">
          <Link href="/">omuso</Link>
        </header>
        <main role="main" className="pb-10">
          {children}
        </main>
      </body>
    </html>
  )
}
