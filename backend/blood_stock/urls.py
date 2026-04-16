from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register('banks', views.BloodBankViewSet, basename='blood-bank')
router.register('stocks', views.BloodStockViewSet, basename='blood-stock')
router.register('transactions', views.StockTransactionViewSet, basename='stock-transaction')

urlpatterns = [path('', include(router.urls))]
