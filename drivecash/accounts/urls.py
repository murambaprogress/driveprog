from django.urls import path
from . import views
from rest_framework_simplejwt.views import TokenRefreshView, TokenVerifyView

urlpatterns = [
    path('register/', views.register_user, name='register_user'),
    path('verify-otp/', views.verify_otp, name='verify_otp'),
    path('login/', views.login_user, name='login_user'),
    path('profile/', views.get_user_profile, name='get_user_profile'),
    path('profile/update/', views.update_user_profile, name='update_user_profile'),
    path('password-reset-request/', views.password_reset_request, name='password_reset_request'),
    path('password-reset/', views.password_reset, name='password_reset'),
    path('create-admin/', views.create_hardcoded_admin, name='create_hardcoded_admin'),
    path('admin/update-email/', views.update_admin_email, name='update_admin_email'),
    path('admin/login/step1/', views.admin_login_step1, name='admin_login_step1'),
    path('admin/login/step2/', views.admin_login_step2, name='admin_login_step2'),
    # JWT Token endpoints
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('token/verify/', TokenVerifyView.as_view(), name='token_verify'),
]