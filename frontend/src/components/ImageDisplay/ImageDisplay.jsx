import React from 'react'
import './ImageDisplay.css'

export default function ImageDisplay({ type, value, url, alt }) {
  if (type === 'emoji') {
    return <span className="image-display-emoji">{value}</span>
  }
  if (url) {
    return <img className="image-display-img" src={url} alt={alt || ''} loading="lazy" />
  }
  return null
}
