from django.db import models
from .rating_converter import convert_to_cf_rating, get_difficulty_tier

class Platform(models.TextChoices):
    CODEFORCES = 'CODEFORCES', 'Codeforces'
    CODECHEF = 'CODECHEF', 'CodeChef'
    ATCODER = 'ATCODER', 'AtCoder'

class DifficultyTier(models.TextChoices):
    EASY = 'EASY', 'Easy (Div. 4)'
    MEDIUM = 'MEDIUM', 'Medium (Div. 3)'
    HARD = 'HARD', 'Hard (Div. 2)'

class Problem(models.Model):
    platform = models.CharField(max_length=20, choices=Platform.choices)
    problem_id = models.CharField(max_length=100)
    title = models.CharField(max_length=255)
    url = models.URLField(max_length=500)
    
    # Original rating on the native platform
    original_rating = models.IntegerField(default=800)
    
    # Unified rating mapped to Codeforces standard
    normalized_cf_rating = models.IntegerField(default=800, db_index=True)
    
    # Preset tier (EASY = Div 4, MEDIUM = Div 3, HARD = Div 2)
    difficulty_tier = models.CharField(
        max_length=10, 
        choices=DifficultyTier.choices, 
        default=DifficultyTier.EASY,
        db_index=True
    )
    
    tags = models.CharField(max_length=255, blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('platform', 'problem_id')
        ordering = ['normalized_cf_rating']

    def save(self, *args, **kwargs):
        if not self.normalized_cf_rating or self.normalized_cf_rating == 800:
            self.normalized_cf_rating = convert_to_cf_rating(self.platform, self.original_rating)
        self.difficulty_tier = get_difficulty_tier(self.normalized_cf_rating)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"[{self.platform}] {self.title} (Norm: {self.normalized_cf_rating})"
