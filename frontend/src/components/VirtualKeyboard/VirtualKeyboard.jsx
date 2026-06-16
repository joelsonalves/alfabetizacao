import React from 'react'
import { ROWS, KEY_WIDTH } from '../../constants/keyboard'
import './VirtualKeyboard.css'

export default function VirtualKeyboard({ pressedKey, onKeyClick, disabled }) {
  const getKeyClass = (key) => {
    const classes = ['vk-key']
    if (pressedKey === key) classes.push('vk-key-pressed')
    if (disabled) classes.push('vk-key-disabled')
    return classes.join(' ')
  }

  return (
    <div className={`virtual-keyboard ${disabled ? 'vk-disabled' : ''}`}>
      {ROWS.map((row, rowIdx) => (
        <div key={rowIdx} className="vk-row">
          {row.map((key) => {
            const isSpace = key === ' '
            return (
              <button
                key={key}
                className={getKeyClass(key)}
                style={{ flex: isSpace ? 6 : 1 }}
                onClick={() => onKeyClick(key)}
                disabled={disabled}
                aria-label={isSpace ? 'Espaço' : `Letra ${key}`}
              >
                {isSpace ? '' : key}
              </button>
            )
          })}
        </div>
      ))}
    </div>
  )
}
