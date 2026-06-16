from unittest.mock import Mock
from datetime import datetime

from app.services.progress import calculate_level, xp_needed_for_level, check_version_conflict
from app.models.progress import UserProgress
from app.schemas.module import ProgressUpdate


class TestCalculateLevel:
    def test_below_threshold_stays_same(self):
        assert calculate_level(400, 1) == 1

    def test_exactly_at_threshold_levels_up(self):
        assert calculate_level(500, 1) == 2

    def test_multiple_levels_2500_xp(self):
        assert calculate_level(2500, 1) == 6

    def test_high_level(self):
        assert calculate_level(5500, 5) == 12


class TestXpNeededForLevel:
    def test_level_1_needs_500(self):
        assert xp_needed_for_level(1) == 500

    def test_level_3_needs_1500(self):
        assert xp_needed_for_level(3) == 1500


class TestCheckVersionConflict:
    def test_no_conflict_when_versions_match(self):
        progress = Mock(version=5)
        assert check_version_conflict(progress, 5) is False

    def test_conflict_when_versions_differ(self):
        progress = Mock(version=5)
        assert check_version_conflict(progress, 3) is True

    def test_no_conflict_when_data_version_none(self):
        progress = Mock(version=5)
        assert check_version_conflict(progress, None) is False


class TestApplyProgressUpdate:
    def test_initial_update(self):
        progress = UserProgress()
        data = ProgressUpdate(score=50, stars=3, completed=True, attempts=1)
        from app.services.progress import apply_progress_update
        apply_progress_update(progress, data)
        assert progress.score == 50
        assert progress.stars == 3
        assert progress.attempts == 1
        assert progress.completed is True
        assert progress.version == 1

    def test_accumulates_score(self):
        progress = UserProgress(score=30)
        data = ProgressUpdate(score=20, stars=2, completed=False, attempts=1)
        from app.services.progress import apply_progress_update
        apply_progress_update(progress, data)
        assert progress.score == 50

    def test_takes_max_stars(self):
        progress = UserProgress(stars=2)
        data = ProgressUpdate(score=0, stars=1, completed=False, attempts=0)
        from app.services.progress import apply_progress_update
        apply_progress_update(progress, data)
        assert progress.stars == 2
