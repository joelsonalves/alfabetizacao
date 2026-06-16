export function createSyntheticKeyboardEvent(key) {
  return { key, preventDefault: () => {} }
}
