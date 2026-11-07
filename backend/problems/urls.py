from django.urls import path
from .views import ProblemListView, RatingConverterView, FetchExternalProblemsView

urlpatterns = [
    path('', ProblemListView.as_view(), name='problem-list'),
    path('convert-rating/', RatingConverterView.as_view(), name='convert-rating'),
    path('fetch-external/', FetchExternalProblemsView.as_view(), name='fetch-external'),
]
