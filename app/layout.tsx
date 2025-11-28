import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { ThemeProviderWrapper } from '@/components/theme-provider-wrapper'
import './globals.css'

export const metadata: Metadata = {
  title: 'Perfect Circle',
  description: 'Perfect Circle',
  generator: 'Perfect Circle',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('theme') || 
                    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
                  document.documentElement.classList.add(theme);
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body>
        <ThemeProviderWrapper>{children}</ThemeProviderWrapper>
      </body>
    </html>
  )
}
