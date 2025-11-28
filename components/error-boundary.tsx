"use client"

import React, { Component, ReactNode } from "react"
import { Button } from "@/components/ui/button"

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-4">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="text-6xl mb-4">⚠️</div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-200">
              Something went wrong
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              An unexpected error occurred. Don't worry, your scores are safe!
            </p>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg text-left">
                <p className="text-sm font-mono text-red-800 dark:text-red-200 break-all">
                  {this.state.error.toString()}
                </p>
              </div>
            )}
            <Button 
              onClick={this.handleReset}
              className="mt-6"
            >
              Try Again
            </Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

