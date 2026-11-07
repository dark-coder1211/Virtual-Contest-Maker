from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.utils import timezone
from django.shortcuts import get_object_or_404
from problems.models import DifficultyTier
from .models import Contest, ContestProblem, ContestParticipation, ProblemSubmissionStatus
from .serializers import ContestSerializer, ContestParticipationSerializer
from .sync_service import generate_virtual_contest, sync_contest_submissions

class ContestListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        contests = Contest.objects.all().order_by('-created_at')[:30]
        serializer = ContestSerializer(contests, many=True)
        return Response(serializer.data)

class CreateContestView(APIView):
    """
    Creates a new virtual contest based on difficulty preset:
    - EASY (Div 4)
    - MEDIUM (Div 3)
    - HARD (Div 2)
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        difficulty = request.data.get('difficulty', DifficultyTier.EASY).upper()
        if difficulty not in dict(DifficultyTier.choices):
            difficulty = DifficultyTier.EASY

        duration_minutes = int(request.data.get('duration_minutes', 120))
        problem_count = int(request.data.get('problem_count', 6))
        title = request.data.get('title', '').strip() or None

        contest = generate_virtual_contest(
            user=request.user,
            difficulty=difficulty,
            duration_minutes=duration_minutes,
            problem_count=problem_count,
            title=title
        )

        # Automatically start participation for the user
        participation = ContestParticipation.objects.create(
            contest=contest,
            user=request.user,
            start_time=timezone.now()
        )

        # Initialize status for each problem
        for cp in contest.contest_problems.all():
            ProblemSubmissionStatus.objects.create(
                participation=participation,
                contest_problem=cp
            )

        return Response({
            'contest': ContestSerializer(contest).data,
            'participation_id': participation.id
        }, status=status.HTTP_201_CREATED)

class ContestDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, pk):
        contest = get_object_or_404(Contest, pk=pk)
        return Response(ContestSerializer(contest).data)

class StartContestView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        contest = get_object_or_404(Contest, pk=pk)
        participation, created = ContestParticipation.objects.get_or_create(
            contest=contest,
            user=request.user,
            defaults={'start_time': timezone.now()}
        )

        # Ensure all problem statuses exist
        for cp in contest.contest_problems.all():
            ProblemSubmissionStatus.objects.get_or_create(
                participation=participation,
                contest_problem=cp
            )

        return Response(ContestParticipationSerializer(participation).data)

class ParticipationDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        participation = get_object_or_404(ContestParticipation, pk=pk, user=request.user)
        return Response(ContestParticipationSerializer(participation).data)

class SyncSubmissionsView(APIView):
    """
    Queries Codeforces, AtCoder, and CodeChef to sync solved problems.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        participation = get_object_or_404(ContestParticipation, pk=pk, user=request.user)
        sync_result = sync_contest_submissions(participation)
        updated_data = ContestParticipationSerializer(participation).data
        return Response({
            'sync_result': sync_result,
            'participation': updated_data
        })

class FinishContestView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        participation = get_object_or_404(ContestParticipation, pk=pk, user=request.user)
        participation.is_finished = True
        participation.save()
        return Response(ContestParticipationSerializer(participation).data)

class ManualMarkSolvedView(APIView):
    """
    Allows manually marking a problem as solved (with optional submission link).
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        participation = get_object_or_404(ContestParticipation, pk=pk, user=request.user)
        contest_problem_id = request.data.get('contest_problem_id')
        submission_url = request.data.get('submission_url', '').strip()

        status_obj = get_object_or_404(
            ProblemSubmissionStatus, 
            participation=participation, 
            contest_problem_id=contest_problem_id
        )

        status_obj.is_solved = not status_obj.is_solved
        if status_obj.is_solved:
            status_obj.solved_at = timezone.now()
            if submission_url:
                status_obj.platform_submission_url = submission_url
        else:
            status_obj.solved_at = None

        status_obj.save()

        # Recalculate
        participation.solved_count = participation.problem_statuses.filter(is_solved=True).count()
        participation.total_score = sum(
            s.contest_problem.points for s in participation.problem_statuses.filter(is_solved=True)
        )
        participation.save()

        return Response(ContestParticipationSerializer(participation).data)

class UserContestHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        participations = ContestParticipation.objects.filter(user=request.user).order_by('-start_time')
        return Response(ContestParticipationSerializer(participations, many=True).data)
