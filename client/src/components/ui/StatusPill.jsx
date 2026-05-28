import React from 'react'
import { getPollStatus } from '../../utils/helpers.js'

const pillClasses = {
  live: 'pill-live',
  draft: 'pill-draft',
  published: 'pill-published',
  expired: 'pill-expired',
}

const dots = {
  live: 'bg-amber',
  draft: 'bg-ink-faint',
  published: 'bg-green-500',
  expired: 'bg-red-400',
}

export default function StatusPill({ poll }) {
  const { label, key } = getPollStatus(poll)
  return (
    <span className={pillClasses[key]}>
      <span className={`w-1.5 h-1.5 rounded-full ${dots[key]} ${key === 'live' ? 'animate-pulse' : ''}`} />
      {label}
    </span>
  )
}