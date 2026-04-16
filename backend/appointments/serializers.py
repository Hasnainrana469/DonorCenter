from rest_framework import serializers
from .models import Appointment


class AppointmentSerializer(serializers.ModelSerializer):
    donor_name = serializers.CharField(source='donor.username', read_only=True)

    class Meta:
        model = Appointment
        fields = '__all__'
        read_only_fields = ['donor', 'created_at', 'updated_at', 'reminder_sent']

    def create(self, validated_data):
        validated_data['donor'] = self.context['request'].user
        return super().create(validated_data)
