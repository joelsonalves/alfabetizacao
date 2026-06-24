# gamification Specification

## Purpose
TBD - created by archiving change alfabetizacao-multissensorial. Update Purpose after archive.
## Requirements
### Requirement: Points system
The system SHALL award points for each correct action during lessons.

#### Scenario: Points for letters
- **WHEN** user correctly types a letter
- **THEN** system awards 10 points

#### Scenario: Points for syllables
- **WHEN** user correctly types a syllable
- **THEN** system awards 25 points

#### Scenario: Points for words
- **WHEN** user correctly types a word
- **THEN** system awards 50 points

#### Scenario: Points for phrases/sentences
- **WHEN** user correctly types a phrase or sentence
- **THEN** system awards 100 points

### Requirement: Star rating
Each lesson SHALL award 1 to 3 stars based on accuracy.

#### Scenario: 3 stars
- **WHEN** user completes lesson with 90%+ accuracy
- **THEN** system awards 3 stars

#### Scenario: 2 stars
- **WHEN** user completes lesson with 70-89% accuracy
- **THEN** system awards 2 stars

#### Scenario: 1 star
- **WHEN** user completes lesson with 50-69% accuracy
- **THEN** system awards 1 star

### Requirement: Streaks
The system SHALL track consecutive daily login streaks and award bonus points.

#### Scenario: Streak tracking
- **WHEN** user logs in on consecutive days
- **THEN** system increments streak counter and shows streak badge

#### Scenario: Streak bonus
- **WHEN** user has 7+ day streak
- **THEN** system awards 100 bonus points daily

### Requirement: Achievements
The system SHALL award achievements for milestones.

#### Scenario: First letter achievement
- **WHEN** user types their first correct letter
- **THEN** system awards "Primeira Letra" achievement

#### Scenario: Level completion achievement
- **WHEN** user completes all lessons in a level
- **THEN** system awards level-specific achievement

#### Scenario: Perfect lesson achievement
- **WHEN** user gets 100% accuracy on any lesson
- **THEN** system awards "Perfeito!" achievement

### Requirement: User level progression
The system SHALL calculate user level based on total XP.

#### Scenario: Level up
- **WHEN** user accumulates enough XP for next level
- **THEN** system displays level-up animation and unlocks new features

