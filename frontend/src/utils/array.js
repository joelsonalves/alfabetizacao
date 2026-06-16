export function isSubsequence(targetWords, transcriptWords) {
  let ti = 0
  for (const tw of transcriptWords) {
    if (ti < targetWords.length && tw === targetWords[ti]) ti++
  }
  return ti === targetWords.length
}
