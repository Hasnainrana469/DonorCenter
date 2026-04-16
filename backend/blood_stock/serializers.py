from rest_framework import serializers
from .models import BloodBank, BloodStock, StockTransaction


class BloodStockSerializer(serializers.ModelSerializer):
    units_free = serializers.FloatField(read_only=True)
    status = serializers.CharField(read_only=True)

    class Meta:
        model = BloodStock
        fields = '__all__'


class BloodBankSerializer(serializers.ModelSerializer):
    stocks = BloodStockSerializer(many=True, read_only=True)

    class Meta:
        model = BloodBank
        fields = '__all__'


class StockTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = StockTransaction
        fields = '__all__'
        read_only_fields = ['created_at']
