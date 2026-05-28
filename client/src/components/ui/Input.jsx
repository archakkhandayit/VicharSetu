import React from 'react'

export default function Input({ label, error, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-xs text-ink-muted font-medium tracking-wide">
          {label}
        </label>
      )}
      <input
        className={`input-field ${error ? 'border-red-400 focus:border-red-400' : ''} ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}

export function Textarea({ label, error, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-xs text-ink-muted font-medium tracking-wide">
          {label}
        </label>
      )}
      <textarea
        className={`input-field resize-none ${error ? 'border-red-400' : ''} ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}