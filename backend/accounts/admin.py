from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, OTPVerification


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ['username', 'email', 'phone', 'role', 'city', 'is_phone_verified', 'is_active']
    list_filter = ['role', 'is_phone_verified', 'is_email_verified', 'city']
    search_fields = ['username', 'email', 'phone']
    fieldsets = UserAdmin.fieldsets + (
        ('Extra Info', {'fields': ('role', 'phone', 'profile_picture', 'city', 'country',
                                   'latitude', 'longitude', 'language',
                                   'is_phone_verified', 'is_email_verified')}),
    )


@admin.register(OTPVerification)
class OTPAdmin(admin.ModelAdmin):
    list_display = ['user', 'otp_type', 'code', 'is_used', 'created_at', 'expires_at']
    list_filter = ['otp_type', 'is_used']
