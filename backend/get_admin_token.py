import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'drivecash_backend.settings')
django.setup()

from accounts.models import User
from rest_framework_simplejwt.tokens import RefreshToken

admin = User.objects.get(user_type='admin')
refresh = RefreshToken.for_user(admin)
print(f'Admin Email: {admin.email}')
print(f'Admin Token:\n{refresh.access_token}')
