import React from 'react'

export default function EmptyState({ title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
      <div className="w-12 h-12 rounded-full bg-paper-warm border border-paper-border flex items-center justify-center mb-4">
        <span className="text-ink-faint text-xl font-serif italic">·</span>
      </div>
      <h3 className="text-md font-medium text-ink mb-1">{title}</h3>
      {description && <p className="text-sm text-ink-muted mb-5 max-w-xs">{description}</p>}
      {action}
    </div>
  )
}