from rest_framework import serializers
from .models import BloodRequest, RequestResponse
from accounts.serializers import UserProfileSerializer


class BloodRequestSerializer(serializers.ModelSerializer):
    requester = UserProfileSerializer(read_only=True)
    responses_count = serializers.SerializerMethodField()

    class Meta:
        model = BloodRequest
        fields = '__all__'
        read_only_fields = ['requester', 'created_at', 'updated_at']

    def get_responses_count(self, obj) -> int:
        return obj.responses.count()

    def create(self, validated_data):
        validated_data['requester'] = self.context['request'].user
        return super().create(validated_data)


class RequestResponseSerializer(serializers.ModelSerializer):
    donor = UserProfileSerializer(read_only=True)

    class Meta:
        model = RequestResponse
        fields = '__all__'
        read_only_fields = ['donor', 'blood_request', 'created_at']

    def create(self, validated_data):
        validated_data['donor'] = self.context['request'].user
        return super().create(validated_data)
