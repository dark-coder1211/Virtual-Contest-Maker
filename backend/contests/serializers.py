from rest_framework import serializers
from .models import Contest, ContestProblem, ContestParticipation, ProblemSubmissionStatus
from problems.serializers import ProblemSerializer

class ContestProblemSerializer(serializers.ModelSerializer):
    problem = ProblemSerializer(read_only=True)

    class Meta:
        model = ContestProblem
        fields = ['id', 'letter_index', 'order', 'points', 'problem']

class ContestSerializer(serializers.ModelSerializer):
    contest_problems = ContestProblemSerializer(many=True, read_only=True)
    difficulty_display = serializers.CharField(source='get_difficulty_display', read_only=True)

    class Meta:
        model = Contest
        fields = [
            'id',
            'title',
            'difficulty',
            'difficulty_display',
            'duration_minutes',
            'created_at',
            'contest_problems'
        ]

class ProblemSubmissionStatusSerializer(serializers.ModelSerializer):
    contest_problem = ContestProblemSerializer(read_only=True)

    class Meta:
        model = ProblemSubmissionStatus
        fields = [
            'id',
            'contest_problem',
            'is_solved',
            'solved_at',
            'platform_submission_url',
            'last_synced_at'
        ]

class ContestParticipationSerializer(serializers.ModelSerializer):
    contest = ContestSerializer(read_only=True)
    problem_statuses = ProblemSubmissionStatusSerializer(many=True, read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = ContestParticipation
        fields = [
            'id',
            'contest',
            'user',
            'username',
            'start_time',
            'is_finished',
            'total_score',
            'solved_count',
            'problem_statuses'
        ]
