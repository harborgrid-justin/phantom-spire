import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { AppRouterCacheProvider } from '@mui/material-nextjs/v13-appRouter'
import { theme } from '../src/lib/theme'
import { QueryProvider } from '../src/components/providers/QueryProvider'
import { MLCoreProvider } from '../src/components/providers/MLCoreProvider'
import { ToastProvider } from '../src/components/providers/ToastProvider'
import { Navigation } from '../src/components/layouts/Navigation'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Phantom ML Studio',
  description: 'Enterprise Machine Learning Platform for Security Analytics',
  keywords: ['machine learning', 'security', 'analytics', 'threat detection', 'AI'],
  authors: [{ name: 'Phantom Spire Team' }],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AppRouterCacheProvider>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <QueryProvider>
              <MLCoreProvider>
                <ToastProvider>
                  <div className="min-h-screen bg-gray-50">
                    <Navigation />
                    <main className="flex-1 pt-16">
                      {children}
                    </main>
                  </div>
                </ToastProvider>
              </MLCoreProvider>
            </QueryProvider>
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  )
}