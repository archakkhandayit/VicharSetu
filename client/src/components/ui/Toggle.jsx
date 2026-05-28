import React from 'react'

export default function Toggle({ checked, onChange, label, description }) {
  return (
    <label className="flex items-start gap-3 cursor-pointer group">
      <div className="relative mt-0.5 shrink-0">
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <div
          className={`w-9 h-5 rounded-full transition-colors duration-200 ${
            checked ? 'bg-amber' : 'bg-paper-border'
          }`}
        />
        <div
          className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${
            checked ? 'translate-x-4' : 'translate-x-0'
          }`}
        />
      </div>
      <div>
        {label && <p className="text-sm text-ink leading-tight">{label}</p>}
        {description && <p className="text-xs text-ink-muted mt-0.5">{description}</p>}
      </div>
    </label>
  )
}