export function normalize(s) {
  return (s || '')
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Z\s]/g, '')
    .trim()
}

export function stripSpaces(s) {
  return (s || '').replace(/\s+/g, '')
}

export function getExpectedChar(target, typedChars) {
  if (!target) return null
  const idx = (typedChars || '').length
  if (idx < target.length) return target[idx].toUpperCase()
  return null
}

export function normalizeKey(s) {
  return (s || '').toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}
