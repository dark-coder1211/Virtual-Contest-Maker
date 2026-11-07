from django.db import models
from django.conf import settings
from problems.models import Problem, DifficultyTier

class Contest(models.Model):
    title = models.CharField(max_length=255)
    difficulty = models.CharField(max_length=10, choices=DifficultyTier.choices, default=DifficultyTier.EASY)
    duration_minutes = models.IntegerField(default=120)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='created_contests',
        null=True, 
        blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} ({self.get_difficulty_display()})"

class ContestProblem(models.Model):
    contest = models.ForeignKey(Contest, on_delete=models.CASCADE, related_name='contest_problems')
    problem = models.ForeignKey(Problem, on_delete=models.CASCADE, related_name='contest_instances')
    letter_index = models.CharField(max_length=5) # 'A', 'B', 'C', 'D', etc.
    order = models.IntegerField(default=0)
    points = models.IntegerField(default=500)

    class Meta:
        ordering = ['order']
        unique_together = ('contest', 'order')

    def __str__(self):
        return f"{self.contest.title} - {self.letter_index}: {self.problem.title}"

class ContestParticipation(models.Model):
    contest = models.ForeignKey(Contest, on_delete=models.CASCADE, related_name='participations')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='participations')
    start_time = models.DateTimeField(auto_now_add=True)
    is_finished = models.BooleanField(default=False)
    total_score = models.IntegerField(default=0)
    solved_count = models.IntegerField(default=0)

    class Meta:
        ordering = ['-start_time']

    def __str__(self):
        return f"{self.user.username} in {self.contest.title}"

class ProblemSubmissionStatus(models.Model):
    participation = models.ForeignKey(ContestParticipation, on_delete=models.CASCADE, related_name='problem_statuses')
    contest_problem = models.ForeignKey(ContestProblem, on_delete=models.CASCADE)
    is_solved = models.BooleanField(default=False)
    solved_at = models.DateTimeField(null=True, blank=True)
    platform_submission_url = models.CharField(max_length=500, blank=True, default='')
    last_synced_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('participation', 'contest_problem')

    def __str__(self):
        status = "SOLVED" if self.is_solved else "UNSOLVED"
        return f"{self.participation.user.username} - {self.contest_problem.letter_index} [{status}]"
