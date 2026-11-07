import requests
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate, get_user_model
from .serializers import UserSerializer, RegisterSerializer

User = get_user_model()

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            token, _ = Token.objects.get_or_create(user=user)
            return Response({
                'token': token.key,
                'user': UserSerializer(user).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        if not username or not password:
            return Response({'error': 'Please provide both username and password'}, status=status.HTTP_400_BAD_REQUEST)

        user = authenticate(username=username, password=password)
        if not user:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

        token, _ = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user': UserSerializer(user).data
        })

class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)

    def patch(self, request):
        user = request.user
        for field in ['codeforces_handle', 'codechef_handle', 'atcoder_handle', 'email']:
            if field in request.data:
                setattr(user, field, request.data[field].strip())
        user.save()
        return Response(UserSerializer(user).data)

class VerifyHandlesView(APIView):
    """
    Verifies existence of handles on Codeforces, CodeChef, and AtCoder.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        cf = request.data.get('codeforces_handle', '').strip()
        cc = request.data.get('codechef_handle', '').strip()
        ac = request.data.get('atcoder_handle', '').strip()

        results = {}

        if cf:
            try:
                r = requests.get(f'https://codeforces.com/api/user.info?handles={cf}', timeout=5)
                results['codeforces'] = {'valid': r.status_code == 200 and r.json().get('status') == 'OK'}
            except Exception:
                results['codeforces'] = {'valid': True, 'warning': 'Could not reach Codeforces API, skipped check'}

        if ac:
            try:
                r = requests.get(f'https://atcoder.jp/users/{ac}', timeout=5)
                results['atcoder'] = {'valid': r.status_code == 200}
            except Exception:
                results['atcoder'] = {'valid': True, 'warning': 'Could not reach AtCoder, skipped check'}

        if cc:
            try:
                r = requests.get(f'https://www.codechef.com/users/{cc}', timeout=5)
                results['codechef'] = {'valid': r.status_code == 200}
            except Exception:
                results['codechef'] = {'valid': True, 'warning': 'Could not reach CodeChef, skipped check'}

        return Response(results)
