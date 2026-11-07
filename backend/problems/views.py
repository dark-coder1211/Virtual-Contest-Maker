import requests
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.db.models import Q
from .models import Problem, Platform, DifficultyTier
from .serializers import ProblemSerializer
from .rating_converter import convert_to_cf_rating, get_difficulty_tier

class ProblemListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        queryset = Problem.objects.all()
        
        platform = request.query_params.get('platform')
        tier = request.query_params.get('tier')
        search = request.query_params.get('search')
        min_rating = request.query_params.get('min_rating')
        max_rating = request.query_params.get('max_rating')

        if platform:
            queryset = queryset.filter(platform=platform.upper())
        if tier:
            queryset = queryset.filter(difficulty_tier=tier.upper())
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) | 
                Q(problem_id__icontains=search) |
                Q(tags__icontains=search)
            )
        if min_rating and min_rating.isdigit():
            queryset = queryset.filter(normalized_cf_rating__gte=int(min_rating))
        if max_rating and max_rating.isdigit():
            queryset = queryset.filter(normalized_cf_rating__lte=int(max_rating))

        # Always order by normalized Codeforces rating
        queryset = queryset.order_by('normalized_cf_rating')
        serializer = ProblemSerializer(queryset, many=True)
        return Response(serializer.data)

class RatingConverterView(APIView):
    """
    Utility endpoint to convert rating of any platform to Codeforces equivalent.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        platform = request.data.get('platform', 'CODEFORCES').upper()
        try:
            original_rating = int(request.data.get('original_rating', 800))
        except (ValueError, TypeError):
            return Response({'error': 'Invalid rating number'}, status=status.HTTP_400_BAD_REQUEST)

        normalized_rating = convert_to_cf_rating(platform, original_rating)
        tier = get_difficulty_tier(normalized_rating)

        return Response({
            'platform': platform,
            'original_rating': original_rating,
            'normalized_cf_rating': normalized_rating,
            'difficulty_tier': tier
        })

class FetchExternalProblemsView(APIView):
    """
    Fetches real public problems from Codeforces API and synchronizes into the database.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        count_added = 0
        try:
            # Fetch from Codeforces API
            r = requests.get('https://codeforces.com/api/problemset.problems', timeout=10)
            if r.status_code == 200:
                data = r.json()
                if data.get('status') == 'OK':
                    problems = data.get('result', {}).get('problems', [])
                    # Pick up to 50 rated problems
                    for p in problems:
                        rating = p.get('rating')
                        if rating and 800 <= rating <= 2400:
                            p_id = f"{p['contestId']}{p['index']}"
                            p_url = f"https://codeforces.com/problemset/problem/{p['contestId']}/{p['index']}"
                            tags = ", ".join(p.get('tags', []))
                            obj, created = Problem.objects.get_or_create(
                                platform=Platform.CODEFORCES,
                                problem_id=p_id,
                                defaults={
                                    'title': p.get('name', p_id),
                                    'url': p_url,
                                    'original_rating': rating,
                                    'normalized_cf_rating': rating,
                                    'tags': tags
                                }
                            )
                            if created:
                                count_added += 1
                            if count_added >= 30:
                                break
        except Exception as e:
            return Response({'error': f'Failed to fetch external problems: {str(e)}'}, status=500)

        return Response({
            'message': f'Successfully synchronized external problems',
            'new_problems_added': count_added,
            'total_problems': Problem.objects.count()
        })
