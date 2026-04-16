from django.contrib import admin
from .models import BloodRequest, RequestResponse


@admin.register(BloodRequest)
class BloodRequestAdmin(admin.ModelAdmin):
    list_display = ['requester', 'blood_type', 'urgency', 'status', 'city', 'created_at']
    list_filter = ['blood_type', 'urgency', 'status', 'city']
    search_fields = ['requester__username', 'hospital_name', 'city']
    ordering = ['-created_at']


@admin.register(RequestResponse)
class RequestResponseAdmin(admin.ModelAdmin):
    list_display = ['blood_request', 'donor', 'status', 'created_at']
    list_filter = ['status']
