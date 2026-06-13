import React from 'react'
import './ProgressBar.css'

export default function ProgressBar({ value = 0, max = 100, label }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0

  return (
    <div className="progress-bar-wrapper">
      {label && <span className="progress-label">{label}</span>}
      <div className="progress-bar-track">
        <div
          className="progress-bar-fill"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="progress-text">{pct}%</span>
    </div>
  )
}
