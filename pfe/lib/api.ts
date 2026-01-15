// Helper function to get API base URL
export function getApiUrl() {
  if (typeof window !== 'undefined') {
    // Client-side: use relative URL
    return ''
  }
  // Server-side: use environment variable or default
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
}
