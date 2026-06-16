export function buildProgressMap(progress) {
  const progMap = {}
  if (Array.isArray(progress)) {
    progress.forEach(p => { progMap[p.lesson_id] = p })
  }
  return progMap
}

export function findProgressByLessonId(progressList, lessonId) {
  if (!Array.isArray(progressList)) return undefined
  return progressList.find(p => p.lesson_id === lessonId)
}
