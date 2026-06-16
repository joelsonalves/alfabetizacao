export function parseLessonContent(lesson) {
  const content = typeof lesson.content === 'string'
    ? JSON.parse(lesson.content)
    : lesson.content || { syllables: [], word: lesson.target }
  return content
}
