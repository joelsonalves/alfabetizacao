export const POINTS = { letter: 10, syllable: 25, word: 50, blending: 60, phrase: 100, sentence: 100 }

export const SPEECH_PREFIXES = [
  'LETRA ', 'A LETRA ', 'O SOM DE ', 'SOM DE ', 'SOM DA ', 'O SOM DA ',
  'SÍLABA ', 'A SÍLABA ', 'PALAVRA ', 'A PALAVRA ', 'FRASE ', 'A FRASE ',
  'FALE ', 'DIGA ', 'A ', 'O ',
]

export const SPEECH_TYPE_LABELS = {
  letter: 'LETRA',
  consonant: 'LETRA',
  syllable: 'SÍLABA',
  word: 'PALAVRA',
  phrase: 'FRASE',
  sentence: 'FRASE',
}

export const SPEECH_TYPE_NAMES = {
  letter: 'letra',
  consonant: 'letra',
  syllable: 'sílaba',
  word: 'palavra',
  blending: 'palavra',
  phrase: 'frase',
  sentence: 'frase',
}

export const SPEECH_TIMEOUTS = {
  letter: 4000,
  consonant: 4000,
  syllable: 6000,
  word: 8000,
  blending: 20000,
  phrase: 20000,
  sentence: 20000,
}
