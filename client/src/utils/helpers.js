// Format date to readable string
export const formatDate = (dateStr) => {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

// Check if poll is expired
export const isExpired = (expiresAt) => {
  if (!expiresAt) return false
  return new Date() > new Date(expiresAt)
}

// Get poll status label + style key
export const getPollStatus = (poll) => {
  if (poll.isPublished) return { label: 'Results published', key: 'published' }
  if (isExpired(poll.expiresAt)) return { label: 'Expired', key: 'expired' }
  return { label: 'Live', key: 'live' }
}

// Format large numbers
export const formatCount = (n) => {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(n)
}

// Copy to clipboard
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

// Get public poll URL
export const getPollUrl = (publicLink) => {
  return `${window.location.origin}/p/${publicLink}`
}