from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import User, OTPVerification
from django.utils import timezone
from datetime import timedelta


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'phone', 'password', 'confirm_password',
                  'role', 'city', 'country', 'language']

    def validate(self, data):
        if data['password'] != data.pop('confirm_password'):
            raise serializers.ValidationError("Passwords do not match.")
        return data

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(**data)
        if not user:
            raise serializers.ValidationError("Invalid credentials.")
        refresh = RefreshToken.for_user(user)
        return {
            'user': UserProfileSerializer(user).data,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        }


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'phone', 'role', 'profile_picture',
                  'city', 'country', 'latitude', 'longitude', 'language',
                  'is_phone_verified', 'is_email_verified', 'created_at']
        read_only_fields = ['id', 'created_at', 'is_phone_verified', 'is_email_verified']


class OTPVerifySerializer(serializers.Serializer):
    code = serializers.CharField(max_length=6)
    otp_type = serializers.ChoiceField(choices=['phone', 'email'])

    def validate(self, data):
        user = self.context['request'].user
        now = timezone.now()
        otp = OTPVerification.objects.filter(
            user=user,
            code=data['code'],
            otp_type=data['otp_type'],
            is_used=False,
            expires_at__gt=now
        ).last()
        if not otp:
            raise serializers.ValidationError("Invalid or expired OTP.")
        data['otp'] = otp
        return data
