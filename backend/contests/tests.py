from django.test import TestCase
from django.contrib.auth import get_user_model
from problems.models import Problem, Platform, DifficultyTier
from contests.models import Contest, ContestProblem
from contests.sync_service import generate_virtual_contest

User = get_user_model()

class ContestGeneratorTestCase(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            password='password123',
            codeforces_handle='tourist',
            codechef_handle='gennady',
            atcoder_handle='tourist'
        )
        # Create problems across tiers
        for rating in [800, 900, 1000, 1100, 1200, 1300, 1500, 1700, 1900, 2100]:
            Problem.objects.create(
                platform=Platform.CODEFORCES,
                problem_id=f"CF_{rating}",
                title=f"CF Problem {rating}",
                url=f"https://codeforces.com/problem/{rating}",
                original_rating=rating
            )
            Problem.objects.create(
                platform=Platform.ATCODER,
                problem_id=f"AC_{rating}",
                title=f"AC Problem {rating}",
                url=f"https://atcoder.jp/problem/{rating}",
                original_rating=rating
            )
            Problem.objects.create(
                platform=Platform.CODECHEF,
                problem_id=f"CC_{rating}",
                title=f"CC Problem {rating}",
                url=f"https://codechef.com/problem/{rating}",
                original_rating=rating
            )

    def test_generate_easy_contest(self):
        contest = generate_virtual_contest(
            user=self.user,
            difficulty=DifficultyTier.EASY,
            problem_count=5
        )
        self.assertEqual(contest.difficulty, DifficultyTier.EASY)
        problems = list(contest.contest_problems.select_related('problem').all())
        self.assertEqual(len(problems), 5)

        # Verify ascending order of normalized rating
        ratings = [p.problem.normalized_cf_rating for p in problems]
        self.assertEqual(ratings, sorted(ratings))

    def test_generate_medium_contest(self):
        contest = generate_virtual_contest(
            user=self.user,
            difficulty=DifficultyTier.MEDIUM,
            problem_count=6
        )
        self.assertEqual(contest.difficulty, DifficultyTier.MEDIUM)
        problems = list(contest.contest_problems.select_related('problem').all())
        self.assertEqual(len(problems), 6)
        ratings = [p.problem.normalized_cf_rating for p in problems]
        self.assertEqual(ratings, sorted(ratings))

    def test_generate_hard_contest(self):
        contest = generate_virtual_contest(
            user=self.user,
            difficulty=DifficultyTier.HARD,
            problem_count=6
        )
        self.assertEqual(contest.difficulty, DifficultyTier.HARD)
        problems = list(contest.contest_problems.select_related('problem').all())
        self.assertEqual(len(problems), 6)
        ratings = [p.problem.normalized_cf_rating for p in problems]
        self.assertEqual(ratings, sorted(ratings))
