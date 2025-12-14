import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'
import { emergencyReset } from '../lib/storage-version'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('React Error Boundary caught an error:', error, errorInfo)
  }

  handleReset = () => {
    emergencyReset()
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4" dir="rtl">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-destructive"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>

            <h1 className="text-xl font-bold text-foreground mb-2">
              משהו השתבש
            </h1>

            <p className="text-muted-foreground mb-6">
              אירעה שגיאה בטעינת האפליקציה. נסו לרענן את הדף או לאפס את הנתונים.
            </p>

            {this.state.error && (
              <details className="text-left mb-6 bg-muted-light rounded-lg p-3">
                <summary className="text-sm text-muted-foreground cursor-pointer">
                  פרטי השגיאה
                </summary>
                <pre className="text-xs mt-2 overflow-auto text-destructive">
                  {this.state.error.message}
                </pre>
              </details>
            )}

            <div className="flex flex-col gap-3">
              <button
                onClick={this.handleRetry}
                className="w-full py-3 px-4 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors"
              >
                נסה שוב
              </button>

              <button
                onClick={this.handleReset}
                className="w-full py-3 px-4 bg-destructive/10 text-destructive rounded-xl font-medium hover:bg-destructive/20 transition-colors"
              >
                אפס נתונים ורענן
              </button>
            </div>

            <p className="text-xs text-muted-foreground mt-4">
              אם הבעיה נמשכת, נסו לנקות את הזיכרון המקומי של הדפדפן
            </p>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
