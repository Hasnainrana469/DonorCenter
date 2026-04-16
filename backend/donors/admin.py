from django.contrib import admin
from .models import DonorProfile, DonorRating, DonationHistory, EligibilityCheck


@admin.register(DonorProfile)
class DonorProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'blood_type', 'is_available', 'total_donations', 'average_rating', 'created_at']
    list_filter = ['blood_type', 'is_available']
    search_fields = ['user__username', 'user__city']


@admin.register(DonorRating)
class DonorRatingAdmin(admin.ModelAdmin):
    list_display = ['donor', 'rated_by', 'score', 'created_at']


@admin.register(DonationHistory)
class DonationHistoryAdmin(admin.ModelAdmin):
    list_display = ['donor', 'donation_date', 'units_donated', 'status']
    list_filter = ['status']


@admin.register(EligibilityCheck)
class EligibilityCheckAdmin(admin.ModelAdmin):
    list_display = ['user', 'age', 'weight', 'is_eligible', 'checked_at']
    list_filter = ['is_eligible']
