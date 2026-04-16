from django.contrib import admin
from .models import Appointment


@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ['donor', 'hospital_name', 'scheduled_date', 'status']
    list_filter = ['status']
    search_fields = ['donor__username', 'hospital_name']
