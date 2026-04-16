from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register('profiles', views.DonorProfileViewSet, basename='donor-profile')
router.register('ratings', views.DonorRatingViewSet, basename='donor-rating')
router.register('history', views.DonationHistoryViewSet, basename='donation-history')

urlpatterns = [
    path('', include(router.urls)),
    path('eligibility-check/', views.EligibilityCheckView.as_view(), name='eligibility-check'),
]
