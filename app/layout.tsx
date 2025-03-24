import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Perfect Circle',
  description: 'Perfect Circle',
  generator: 'Perfect Circle',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
