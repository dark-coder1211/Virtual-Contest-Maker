from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    codeforces_handle = models.CharField(max_length=100, blank=True, default='')
    codechef_handle = models.CharField(max_length=100, blank=True, default='')
    atcoder_handle = models.CharField(max_length=100, blank=True, default='')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.username
