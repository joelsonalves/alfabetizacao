import React from 'react'
import './VirtualKeyboard.css'

const ROWS = [
  ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '='],
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '[', ']'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ç', '~'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', ';', '/'],
]

const KEY_WIDTH = {
  'default': 1,
  ' ': 6,
}

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
