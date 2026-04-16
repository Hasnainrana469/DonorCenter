from rest_framework import viewsets, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import BloodBank, BloodStock, StockTransaction
from .serializers import BloodBankSerializer, BloodStockSerializer, StockTransactionSerializer


class BloodBankViewSet(viewsets.ModelViewSet):
    queryset = BloodBank.objects.filter(is_active=True)
    serializer_class = BloodBankSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['city', 'country']
    search_fields = ['name', 'city']

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]

    @action(detail=False, methods=['get'])
    def availability(self, request):
        """Get blood availability summary across all banks"""
        blood_type = request.query_params.get('blood_type')
        city = request.query_params.get('city')

        stocks = BloodStock.objects.select_related('blood_bank').filter(
            blood_bank__is_active=True
        )
        if blood_type:
            stocks = stocks.filter(blood_type=blood_type)
        if city:
            stocks = stocks.filter(blood_bank__city__icontains=city)

        return Response(BloodStockSerializer(stocks, many=True).data)


class BloodStockViewSet(viewsets.ModelViewSet):
    queryset = BloodStock.objects.all()
    serializer_class = BloodStockSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]


class StockTransactionViewSet(viewsets.ModelViewSet):
    queryset = StockTransaction.objects.all()
    serializer_class = StockTransactionSerializer
    permission_classes = [permissions.IsAdminUser]
