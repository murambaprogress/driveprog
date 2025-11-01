from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from accounts.models import User
from .models import AdminProfile
from .serializers import AdminProfileSerializer

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_dashboard(request):
    """
    Admin dashboard view
    """
    if not request.user.is_admin_user:
        return Response(
            {"error": "Access denied. Admin privileges required."}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Get admin profile
    try:
        admin_profile = request.user.admin_profile
    except AdminProfile.DoesNotExist:
        # Create profile if it doesn't exist
        admin_profile = AdminProfile.objects.create(user=request.user)
    
    serializer = AdminProfileSerializer(admin_profile)
    return Response({
        "message": "Welcome to the admin dashboard",
        "profile": serializer.data
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_admin_profile(request):
    """
    Update admin profile
    """
    if not request.user.is_admin_user:
        return Response(
            {"error": "Access denied. Admin privileges required."}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        admin_profile = request.user.admin_profile
    except AdminProfile.DoesNotExist:
        admin_profile = AdminProfile.objects.create(user=request.user)
    
    serializer = AdminProfileSerializer(admin_profile, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
    else:
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_all_users(request):
    """
    Get all regular users with pagination, search, and filters (admin only)
    """
    if not request.user.is_admin_user:
        return Response(
            {"error": "Access denied. Admin privileges required."}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Get query parameters
    page = int(request.GET.get('page', 1))
    page_size = int(request.GET.get('pageSize', 12))
    search = request.GET.get('search', '').strip()
    status_filter = request.GET.get('status', '')
    sort_by = request.GET.get('sortBy', 'created_at')
    sort_order = request.GET.get('sortOrder', 'desc')
    
    # Start with base queryset
    from django.db.models import Q, Sum, Count
    users_query = User.objects.filter(user_type='user')
    
    # Apply search filter
    if search:
        users_query = users_query.filter(
            Q(username__icontains=search) |
            Q(email__icontains=search) |
            Q(first_name__icontains=search) |
            Q(last_name__icontains=search)
        )
    
    # Apply status filter
    if status_filter:
        if status_filter == 'active':
            users_query = users_query.filter(is_active=True, is_verified=True)
        elif status_filter == 'suspended':
            users_query = users_query.filter(is_active=False)
        elif status_filter == 'pending':
            users_query = users_query.filter(is_verified=False)
        elif status_filter == 'verified':
            users_query = users_query.filter(is_verified=True)
    
    # Apply sorting
    sort_field = sort_by
    if sort_order == 'desc':
        sort_field = f'-{sort_field}'
    users_query = users_query.order_by(sort_field)
    
    # Get total count
    total = users_query.count()
    
    # Apply pagination
    start = (page - 1) * page_size
    end = start + page_size
    users = users_query[start:end]
    
    # Format user data with loan statistics
    from loans.models import LoanApplication
    user_data = []
    for user in users:
        # Get user's loan statistics
        user_loans = LoanApplication.objects.filter(user=user)
        total_borrowed = user_loans.filter(
            status__in=['approved', 'disbursed', 'active']
        ).aggregate(total=Sum('amount'))['total'] or 0
        
        active_loans_count = user_loans.filter(status='active').count()
        
        # Determine user status
        if not user.is_active:
            user_status = 'suspended'
        elif not user.is_verified:
            user_status = 'pending'
        else:
            user_status = 'active'
        
        user_data.append({
            'id': user.id,
            'name': f"{user.first_name} {user.last_name}".strip() or user.username,
            'email': user.email,
            'phone': getattr(user, 'phone_number', '') or '',
            'username': user.username,
            'status': user_status,
            'is_verified': user.is_verified,
            'is_active': user.is_active,
            'created_at': user.created_at.isoformat() if user.created_at else None,
            'createdDate': user.created_at.isoformat() if user.created_at else None,
            'last_login': user.last_login.isoformat() if user.last_login else None,
            'totalBorrowed': float(total_borrowed),
            'activeLoans': active_loans_count,
            'creditScore': 720,  # Default for now - can be extended with a credit score model
            'accountBalance': 0,  # Can be extended with account balance tracking
        })
    
    return Response({
        "users": user_data,
        "total": total,
        "page": page,
        "pageSize": page_size,
        "totalPages": (total + page_size - 1) // page_size
    })

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def manage_user(request, user_id):
    """
    Get, update, or delete a specific user (admin only)
    """
    if not request.user.is_admin_user:
        return Response(
            {"error": "Access denied. Admin privileges required."}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        user = User.objects.get(id=user_id, user_type='user')
    except User.DoesNotExist:
        return Response(
            {"error": "User not found"}, 
            status=status.HTTP_404_NOT_FOUND
        )
    
    if request.method == 'GET':
        # Get detailed user information
        from loans.models import LoanApplication
        from django.db.models import Sum
        
        user_loans = LoanApplication.objects.filter(user=user)
        total_borrowed = user_loans.filter(
            status__in=['approved', 'disbursed', 'active']
        ).aggregate(total=Sum('amount'))['total'] or 0
        
        if not user.is_active:
            user_status = 'suspended'
        elif not user.is_verified:
            user_status = 'pending'
        else:
            user_status = 'active'
        
        user_data = {
            'id': user.id,
            'name': f"{user.first_name} {user.last_name}".strip() or user.username,
            'email': user.email,
            'phone': getattr(user, 'phone_number', '') or '',
            'username': user.username,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'status': user_status,
            'is_verified': user.is_verified,
            'is_active': user.is_active,
            'created_at': user.created_at.isoformat() if user.created_at else None,
            'last_login': user.last_login.isoformat() if user.last_login else None,
            'totalBorrowed': float(total_borrowed),
            'activeLoans': user_loans.filter(status='active').count(),
            'creditScore': 720,
            'accountBalance': 0,
        }
        return Response(user_data)
    
    elif request.method == 'PUT':
        # Update user information
        data = request.data
        
        if 'name' in data:
            names = data['name'].split(' ', 1)
            user.first_name = names[0]
            user.last_name = names[1] if len(names) > 1 else ''
        
        if 'email' in data:
            user.email = data['email']
        
        if 'phone' in data:
            user.phone_number = data['phone']
        
        if 'status' in data:
            if data['status'] == 'suspended':
                user.is_active = False
            elif data['status'] == 'active':
                user.is_active = True
                user.is_verified = True
            elif data['status'] == 'pending':
                user.is_verified = False
        
        if 'is_active' in data:
            user.is_active = data['is_active']
        
        if 'is_verified' in data:
            user.is_verified = data['is_verified']
        
        user.save()
        
        return Response({
            "message": "User updated successfully",
            "user": {
                'id': user.id,
                'name': f"{user.first_name} {user.last_name}".strip() or user.username,
                'email': user.email,
                'status': 'suspended' if not user.is_active else ('pending' if not user.is_verified else 'active')
            }
        })
    
    elif request.method == 'DELETE':
        # Delete user
        user_email = user.email
        user.delete()
        return Response({
            "message": f"User {user_email} deleted successfully"
        })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def bulk_update_users(request):
    """
    Bulk update users (admin only)
    """
    if not request.user.is_admin_user:
        return Response(
            {"error": "Access denied. Admin privileges required."}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    user_ids = request.data.get('userIds', [])
    updates = request.data.get('updates', {})
    
    if not user_ids:
        return Response(
            {"error": "No user IDs provided"}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    users = User.objects.filter(id__in=user_ids, user_type='user')
    updated_count = 0
    
    for user in users:
        if 'status' in updates:
            if updates['status'] == 'suspended':
                user.is_active = False
            elif updates['status'] == 'active':
                user.is_active = True
                user.is_verified = True
            elif updates['status'] == 'pending':
                user.is_verified = False
        
        if 'is_active' in updates:
            user.is_active = updates['is_active']
        
        if 'is_verified' in updates:
            user.is_verified = updates['is_verified']
        
        user.save()
        updated_count += 1
    
    return Response({
        "message": f"Successfully updated {updated_count} users",
        "updatedCount": updated_count
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def bulk_delete_users(request):
    """
    Bulk delete users (admin only)
    """
    if not request.user.is_admin_user:
        return Response(
            {"error": "Access denied. Admin privileges required."}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    user_ids = request.data.get('userIds', [])
    
    if not user_ids:
        return Response(
            {"error": "No user IDs provided"}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    deleted_count = User.objects.filter(id__in=user_ids, user_type='user').delete()[0]
    
    return Response({
        "message": f"Successfully deleted {deleted_count} users",
        "deletedCount": deleted_count
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_statistics(request):
    """
    Get user statistics for admin dashboard (admin only)
    """
    if not request.user.is_admin_user:
        return Response(
            {"error": "Access denied. Admin privileges required."}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    from django.db.models import Count, Q
    from datetime import datetime, timedelta
    
    total_users = User.objects.filter(user_type='user').count()
    active_users = User.objects.filter(user_type='user', is_active=True, is_verified=True).count()
    suspended_users = User.objects.filter(user_type='user', is_active=False).count()
    pending_users = User.objects.filter(user_type='user', is_verified=False).count()
    
    # Users created in last 30 days
    thirty_days_ago = datetime.now() - timedelta(days=30)
    new_users = User.objects.filter(
        user_type='user',
        created_at__gte=thirty_days_ago
    ).count()
    
    return Response({
        "total": total_users,
        "active": active_users,
        "suspended": suspended_users,
        "pending": pending_users,
        "newUsersLast30Days": new_users
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_dashboard_statistics(request):
    """
    Get comprehensive dashboard statistics for admin (admin only)
    """
    if not request.user.is_admin_user:
        return Response(
            {"error": "Access denied. Admin privileges required."}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    from django.db.models import Count, Sum, Avg, Q
    from datetime import datetime, timedelta
    from loans.models import LoanApplication
    
    # Date calculations
    now = datetime.now()
    thirty_days_ago = now - timedelta(days=30)
    last_month_start = (now.replace(day=1) - timedelta(days=1)).replace(day=1)
    last_month_end = now.replace(day=1) - timedelta(days=1)
    
    # User Statistics
    total_users = User.objects.filter(user_type='user').count()
    active_users = User.objects.filter(user_type='user', is_active=True, is_verified=True).count()
    new_users_this_month = User.objects.filter(
        user_type='user',
        created_at__gte=thirty_days_ago
    ).count()
    new_users_last_month = User.objects.filter(
        user_type='user',
        created_at__gte=last_month_start,
        created_at__lte=last_month_end
    ).count()
    
    # Calculate user growth percentage
    if new_users_last_month > 0:
        user_growth = ((new_users_this_month - new_users_last_month) / new_users_last_month) * 100
    else:
        user_growth = 100 if new_users_this_month > 0 else 0
    
    # Loan Statistics
    total_loans = LoanApplication.objects.count()
    pending_loans = LoanApplication.objects.filter(status='pending').count()
    approved_loans = LoanApplication.objects.filter(status__in=['approved', 'active', 'disbursed']).count()
    rejected_loans = LoanApplication.objects.filter(status='rejected').count()
    active_loans = LoanApplication.objects.filter(status='active').count()
    
    total_loan_amount = LoanApplication.objects.filter(
        status__in=['approved', 'active', 'disbursed']
    ).aggregate(total=Sum('amount'))['total'] or 0
    
    loans_this_month = LoanApplication.objects.filter(
        created_at__gte=thirty_days_ago
    ).count()
    loans_last_month = LoanApplication.objects.filter(
        created_at__gte=last_month_start,
        created_at__lte=last_month_end
    ).count()
    
    # Calculate loan growth percentage
    if loans_last_month > 0:
        loan_growth = ((loans_this_month - loans_last_month) / loans_last_month) * 100
    else:
        loan_growth = 100 if loans_this_month > 0 else 0
    
    # Approval rate
    if total_loans > 0:
        approval_rate = (approved_loans / total_loans) * 100
    else:
        approval_rate = 0
    
    # Payment/Revenue Statistics (calculated from loans since no Payment model exists)
    # Estimate revenue as 10% of total approved loan amounts (interest + fees)
    total_approved_amount = LoanApplication.objects.filter(
        status__in=['approved', 'active', 'disbursed']
    ).aggregate(total=Sum('amount'))['total'] or 0
    
    total_revenue = total_approved_amount * 0.10  # 10% estimated revenue rate
    
    monthly_loans_amount = LoanApplication.objects.filter(
        status__in=['approved', 'active', 'disbursed'],
        created_at__gte=thirty_days_ago
    ).aggregate(total=Sum('amount'))['total'] or 0
    
    monthly_revenue = monthly_loans_amount * 0.10
    
    last_month_loans_amount = LoanApplication.objects.filter(
        status__in=['approved', 'active', 'disbursed'],
        created_at__gte=last_month_start,
        created_at__lte=last_month_end
    ).aggregate(total=Sum('amount'))['total'] or 0
    
    last_month_revenue = last_month_loans_amount * 0.10
    
    # Total payments count (using approved loans as proxy)
    total_payments = approved_loans
    
    # Calculate revenue growth percentage
    if last_month_revenue > 0:
        revenue_growth = ((monthly_revenue - last_month_revenue) / last_month_revenue) * 100
    else:
        revenue_growth = 100 if monthly_revenue > 0 else 0
    
    # Chart data - Last 9 months user growth
    user_growth_chart = []
    for i in range(8, -1, -1):
        month_start = (now.replace(day=1) - timedelta(days=i*30))
        month_end = month_start + timedelta(days=30)
        count = User.objects.filter(
            user_type='user',
            created_at__gte=month_start,
            created_at__lt=month_end
        ).count()
        user_growth_chart.append(count)
    
    # Chart data - Last 4 weeks loan trends
    loan_trends_chart = {
        'approved': [],
        'pending': [],
        'rejected': []
    }
    for i in range(3, -1, -1):
        week_start = now - timedelta(days=(i+1)*7)
        week_end = now - timedelta(days=i*7)
        
        approved = LoanApplication.objects.filter(
            status__in=['approved', 'active', 'disbursed'],
            created_at__gte=week_start,
            created_at__lt=week_end
        ).count()
        pending = LoanApplication.objects.filter(
            status='pending',
            created_at__gte=week_start,
            created_at__lt=week_end
        ).count()
        rejected = LoanApplication.objects.filter(
            status='rejected',
            created_at__gte=week_start,
            created_at__lt=week_end
        ).count()
        
        loan_trends_chart['approved'].append(approved)
        loan_trends_chart['pending'].append(pending)
        loan_trends_chart['rejected'].append(rejected)
    
    return Response({
        "users": {
            "total": total_users,
            "active": active_users,
            "newThisMonth": new_users_this_month,
            "growth": round(user_growth, 1)
        },
        "loans": {
            "total": total_loans,
            "pending": pending_loans,
            "approved": approved_loans,
            "active": active_loans,
            "totalAmount": float(total_loan_amount),
            "growth": round(loan_growth, 1),
            "approvalRate": round(approval_rate, 1)
        },
        "revenue": {
            "total": float(total_revenue),
            "monthly": float(monthly_revenue),
            "growth": round(revenue_growth, 1),
            "totalPayments": total_payments
        },
        "charts": {
            "userGrowth": user_growth_chart,
            "loanTrends": loan_trends_chart
        }
    })