'use client'

import React, { Component, ReactNode } from 'react'
import { Button } from './ui/button'
import { AlertTriangle } from 'lucide-react'
import { logger } from '@/lib/utils/logger'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
  level?: 'app' | 'route' | 'feature'
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

/**
 * Error Boundary component for catching and handling React errors
 *
 * Usage:
 * ```tsx
 * // App level (in layout.tsx)
 * <ErrorBoundary level="app">
 *   {children}
 * </ErrorBoundary>
 *
 * // Route level (in page.tsx)
 * <ErrorBoundary level="route">
 *   <YourPageComponent />
 * </ErrorBoundary>
 *
 * // Feature level (in feature component)
 * <ErrorBoundary level="feature" fallback={<CustomFallback />}>
 *   <ComplexFeature />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error using centralized logger
    logger.error('React Error Boundary caught an error', error, {
      level: this.props.level,
      componentStack: errorInfo.componentStack,
    })

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo)

    this.setState({
      errorInfo,
    })
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default error UI based on level
      const { level = 'feature' } = this.props
      const { error } = this.state

      if (level === 'app') {
        return (
          <div className="min-h-screen bg-black flex items-center justify-center p-4">
            <div className="max-w-md w-full text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 mb-6">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Something went wrong</h1>
              <p className="text-neutral-400 mb-6">
                We&apos;re sorry, but the application encountered an unexpected error.
              </p>
              {process.env.NODE_ENV === 'development' && error && (
                <div className="mb-6 p-4 bg-red-950/20 border border-red-900 rounded-[24px] text-left">
                  <p className="text-sm font-mono text-red-200 break-all">
                    {error.toString()}
                  </p>
                </div>
              )}
              <div className="flex gap-3 justify-center">
                <Button onClick={this.handleReset} variant="ghost">
                  Try Again
                </Button>
                <Button onClick={this.handleReload}>
                  Reload Page
                </Button>
              </div>
            </div>
          </div>
        )
      }

      if (level === 'route') {
        return (
          <div className="min-h-screen bg-black flex items-center justify-center p-4">
            <div className="max-w-md w-full">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-500/10 mb-4">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Page Error</h2>
              <p className="text-neutral-400 mb-4">
                This page encountered an error and couldn&apos;t be displayed.
              </p>
              {process.env.NODE_ENV === 'development' && error && (
                <div className="mb-4 p-3 bg-red-950/20 border border-red-900 rounded-[24px]">
                  <p className="text-xs font-mono text-red-200 break-all">
                    {error.toString()}
                  </p>
                </div>
              )}
              <div className="flex gap-2">
                <Button onClick={this.handleReset} size="sm" variant="ghost">
                  Try Again
                </Button>
                <Button onClick={() => window.history.back()} size="sm">
                  Go Back
                </Button>
              </div>
            </div>
          </div>
        )
      }

      // Feature level (compact inline error)
      return (
        <div className="p-4 bg-red-950/20 border border-red-900 rounded-[24px]">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-red-200 mb-1">
                Error Loading Component
              </h3>
              <p className="text-xs text-red-300/70 mb-2">
                This feature encountered an error.
              </p>
              {process.env.NODE_ENV === 'development' && error && (
                <p className="text-xs font-mono text-red-200/50 mb-2 break-all">
                  {error.toString()}
                </p>
              )}
              <Button onClick={this.handleReset} size="sm" variant="ghost" className="h-7">
                Retry
              </Button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}