from django.test import TestCase
from problems.models import Problem, Platform, DifficultyTier
from problems.rating_converter import convert_to_cf_rating, get_difficulty_tier

class RatingConverterTestCase(TestCase):
    def test_codeforces_identity(self):
        self.assertEqual(convert_to_cf_rating('CODEFORCES', 1200), 1200)
        self.assertEqual(convert_to_cf_rating('CODEFORCES', 800), 800)
        self.assertEqual(convert_to_cf_rating('CODEFORCES', 2100), 2100)

    def test_atcoder_conversion(self):
        # Gray (<400) maps to 800-950
        cf_easy = convert_to_cf_rating('ATCODER', 200)
        self.assertTrue(800 <= cf_easy <= 950)

        # Brown/Green (400-1200) maps to 950-1500
        cf_med = convert_to_cf_rating('ATCODER', 800)
        self.assertTrue(950 <= cf_med <= 1500)

        # Blue (1600)
        cf_hard = convert_to_cf_rating('ATCODER', 1600)
        self.assertTrue(1500 <= cf_hard <= 2000)

    def test_codechef_conversion(self):
        # CodeChef 1000 maps to ~1000
        cf_low = convert_to_cf_rating('CODECHEF', 1000)
        self.assertTrue(800 <= cf_low <= 1100)

        # CodeChef 1600 maps to ~1450
        cf_mid = convert_to_cf_rating('CODECHEF', 1600)
        self.assertTrue(1300 <= cf_mid <= 1550)

    def test_difficulty_tiers(self):
        self.assertEqual(get_difficulty_tier(800), 'EASY')
        self.assertEqual(get_difficulty_tier(1200), 'EASY')
        self.assertEqual(get_difficulty_tier(1400), 'MEDIUM')
        self.assertEqual(get_difficulty_tier(1900), 'HARD')
