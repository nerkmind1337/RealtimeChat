import Providers from '@/components/providers'
import './globals.css'
import { Inter } from 'next/font/google'


export const metadata = {
  title: 'Real time chat ',
  description: 'App',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body><Providers>{children}</Providers></body>
    </html>
  )
}
