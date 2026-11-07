from rest_framework import serializers
from .models import Problem

class ProblemSerializer(serializers.ModelSerializer):
    platform_display = serializers.CharField(source='get_platform_display', read_only=True)
    difficulty_tier_display = serializers.CharField(source='get_difficulty_tier_display', read_only=True)

    class Meta:
        model = Problem
        fields = [
            'id',
            'platform',
            'platform_display',
            'problem_id',
            'title',
            'url',
            'original_rating',
            'normalized_cf_rating',
            'difficulty_tier',
            'difficulty_tier_display',
            'tags',
            'created_at'
        ]
