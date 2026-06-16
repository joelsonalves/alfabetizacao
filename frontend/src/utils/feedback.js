let feedbackId = 0

export function createFeedback(type, message) {
  return { id: ++feedbackId, type, message }
}
