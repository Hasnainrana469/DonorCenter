from rest_framework import serializers
from .models import DonorProfile, DonorRating, DonationHistory, EligibilityCheck
from accounts.serializers import UserProfileSerializer


class DonorProfileSerializer(serializers.ModelSerializer):
    user = UserProfileSerializer(read_only=True)
    blood_type_display = serializers.CharField(source='get_blood_type_display', read_only=True)

    class Meta:
        model = DonorProfile
        fields = '__all__'
        read_only_fields = ['total_donations', 'average_rating', 'created_at', 'updated_at']


class DonorProfileCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = DonorProfile
        exclude = ['user', 'total_donations', 'average_rating']


class DonorRatingSerializer(serializers.ModelSerializer):
    rated_by_username = serializers.CharField(source='rated_by.username', read_only=True)

    class Meta:
        model = DonorRating
        fields = '__all__'
        read_only_fields = ['rated_by', 'created_at']

    def create(self, validated_data):
        validated_data['rated_by'] = self.context['request'].user
        rating = super().create(validated_data)
        rating.donor.update_rating()
        return rating


class DonationHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = DonationHistory
        fields = '__all__'
        read_only_fields = ['created_at']


class EligibilityCheckSerializer(serializers.ModelSerializer):
    class Meta:
        model = EligibilityCheck
        fields = '__all__'
        read_only_fields = ['user', 'is_eligible', 'reason', 'checked_at']

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        instance = EligibilityCheck(**validated_data)
        instance.check_eligibility()
        instance.save()
        return instance
