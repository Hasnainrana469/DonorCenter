from django.contrib import admin
from .models import BloodBank, BloodStock, StockTransaction


@admin.register(BloodBank)
class BloodBankAdmin(admin.ModelAdmin):
    list_display = ['name', 'city', 'country', 'phone', 'is_active']
    list_filter = ['city', 'country', 'is_active']
    search_fields = ['name', 'city']


@admin.register(BloodStock)
class BloodStockAdmin(admin.ModelAdmin):
    list_display = ['blood_bank', 'blood_type', 'units_available', 'units_reserved', 'last_updated']
    list_filter = ['blood_type']


@admin.register(StockTransaction)
class StockTransactionAdmin(admin.ModelAdmin):
    list_display = ['stock', 'transaction_type', 'units', 'created_at']
    list_filter = ['transaction_type']
