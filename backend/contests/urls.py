from django.urls import path
from .views import (
    ContestListView,
    CreateContestView,
    ContestDetailView,
    StartContestView,
    ParticipationDetailView,
    SyncSubmissionsView,
    FinishContestView,
    ManualMarkSolvedView,
    UserContestHistoryView
)

urlpatterns = [
    path('', ContestListView.as_view(), name='contest-list'),
    path('create/', CreateContestView.as_view(), name='contest-create'),
    path('history/', UserContestHistoryView.as_view(), name='contest-history'),
    path('<int:pk>/', ContestDetailView.as_view(), name='contest-detail'),
    path('<int:pk>/start/', StartContestView.as_view(), name='contest-start'),
    path('participations/<int:pk>/', ParticipationDetailView.as_view(), name='participation-detail'),
    path('participations/<int:pk>/sync/', SyncSubmissionsView.as_view(), name='participation-sync'),
    path('participations/<int:pk>/finish/', FinishContestView.as_view(), name='participation-finish'),
    path('participations/<int:pk>/manual-mark/', ManualMarkSolvedView.as_view(), name='participation-manual-mark'),
]
