from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LoanApplicationViewSet, LoanApplicationDocumentViewSet

router = DefaultRouter()
router.register(r'applications', LoanApplicationViewSet, basename='loan-application')
router.register(r'documents', LoanApplicationDocumentViewSet, basename='loan-document')

# Get the submit view from the viewset
submit_view = LoanApplicationViewSet.as_view({
    'post': 'submit'
})

# Manually add submit endpoint to ensure it's registered
urlpatterns = [
    path('applications/submit/', submit_view, name='loan-submit'),
    path('applications/my_applications/', LoanApplicationViewSet.as_view({'get': 'my_applications'}), name='my-applications'),
    path('applications/dashboard_statistics/', LoanApplicationViewSet.as_view({'get': 'dashboard_statistics'}), name='dashboard-statistics'),
    path('', include(router.urls)),
]
