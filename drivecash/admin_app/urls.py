from django.urls import path
from . import views

urlpatterns = [
    path('dashboard/', views.admin_dashboard, name='admin_dashboard'),
    path('dashboard/statistics/', views.get_dashboard_statistics, name='get_dashboard_statistics'),
    path('profile/update/', views.update_admin_profile, name='update_admin_profile'),
    
    # User Management
    path('users/', views.get_all_users, name='get_all_users'),
    path('users/<int:user_id>/', views.manage_user, name='manage_user'),
    path('users/bulk-update/', views.bulk_update_users, name='bulk_update_users'),
    path('users/bulk-delete/', views.bulk_delete_users, name='bulk_delete_users'),
    path('users/statistics/', views.get_user_statistics, name='get_user_statistics'),
]