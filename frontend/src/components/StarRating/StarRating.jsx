import React from 'react'
import './StarRating.css'

export default function StarRating({ stars = 0, max = 3 }) {
  return (
    <div className="star-rating">
      {Array.from({ length: max }, (_, i) => (
        <span key={i} className={`star ${i < stars ? 'star-filled' : 'star-empty'}`}>
          {i < stars ? '⭐' : '☆'}
        </span>
      ))}
    </div>
  )
}
