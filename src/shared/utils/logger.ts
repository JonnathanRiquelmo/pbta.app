export const logger = {
  error: (message: string, error?: any) => {
    if (import.meta.env.DEV) {
      console.error(message, error)
    }
    // In production, we could send to Sentry/LogRocket here
  },
  warn: (message: string, data?: any) => {
    if (import.meta.env.DEV) {
      console.warn(message, data)
    }
  },
  info: (message: string, data?: any) => {
    if (import.meta.env.DEV) {
      console.info(message, data)
    }
  }
}
