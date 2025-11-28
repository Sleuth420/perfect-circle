"use client"

import { ThemeProvider } from "@/lib/theme-context"
import { ErrorBoundary } from "@/components/error-boundary"
import type { ReactNode } from "react"

export function ThemeProviderWrapper({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary>
      <ThemeProvider>{children}</ThemeProvider>
    </ErrorBoundary>
  )
}

