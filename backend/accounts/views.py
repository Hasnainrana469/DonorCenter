from rest_framework import generics, status, permissions, filters
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from django.conf import settings
from datetime import timedelta
from .models import User, OTPVerification
from .serializers import RegisterSerializer, LoginSerializer, UserProfileSerializer, OTPVerifySerializer
from .utils import send_otp_sms, send_otp_email
from django.db.models import Count


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response({'message': 'Registration successful. Please verify your account.'},
                        status=status.HTTP_201_CREATED)


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.validated_data)


class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class SendOTPView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        otp_type = request.data.get('otp_type', 'phone')
        user = request.user
        code = OTPVerification.generate_code()
        expires_at = timezone.now() + timedelta(minutes=10)

        OTPVerification.objects.create(
            user=user, otp_type=otp_type, code=code, expires_at=expires_at
        )

        if otp_type == 'phone' and user.phone:
            send_otp_sms(user.phone, code)
        elif otp_type == 'email':
            send_otp_email(user.email, code)

        return Response({'message': f'OTP sent to your {otp_type}.'})


class VerifyOTPView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = OTPVerifySerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        otp = serializer.validated_data['otp']
        otp.is_used = True
        otp.save()

        user = request.user
        if otp.otp_type == 'phone':
            user.is_phone_verified = True
        else:
            user.is_email_verified = True
        user.save()

        return Response({'message': f'{otp.otp_type.capitalize()} verified successfully.'})


class AdminStatsView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        from donors.models import DonorProfile
        from requests_app.models import BloodRequest
        from appointments.models import Appointment
        from blood_stock.models import BloodStock

        total_users = User.objects.count()
        total_donors = DonorProfile.objects.count()
        available_donors = DonorProfile.objects.filter(is_available=True).count()
        total_requests = BloodRequest.objects.count()
        open_requests = BloodRequest.objects.filter(status='open').count()
        critical_requests = BloodRequest.objects.filter(status='open', urgency='critical').count()
        fulfilled_requests = BloodRequest.objects.filter(status='fulfilled').count()
        total_appointments = Appointment.objects.count()
        upcoming_appointments = Appointment.objects.filter(
            status__in=['scheduled', 'confirmed'],
            scheduled_date__gte=timezone.now()
        ).count()

        # Blood stock critical counts
        critical_stocks = BloodStock.objects.filter(units_available__lt=5).count()

        # Recent users (last 7 days)
        week_ago = timezone.now() - timedelta(days=7)
        new_users_week = User.objects.filter(created_at__gte=week_ago).count()

        # Users by role
        users_by_role = list(User.objects.values('role').annotate(count=Count('id')))

        # Requests by blood type
        requests_by_blood_type = list(
            BloodRequest.objects.values('blood_type').annotate(count=Count('id')).order_by('-count')
        )

        # Recent requests
        from requests_app.serializers import BloodRequestSerializer
        recent_requests = BloodRequest.objects.select_related('requester').order_by('-created_at')[:5]

        # Recent users
        recent_users = UserProfileSerializer(
            User.objects.order_by('-date_joined')[:5], many=True
        ).data

        return Response({
            'total_users': total_users,
            'total_donors': total_donors,
            'available_donors': available_donors,
            'total_requests': total_requests,
            'open_requests': open_requests,
            'critical_requests': critical_requests,
            'fulfilled_requests': fulfilled_requests,
            'total_appointments': total_appointments,
            'upcoming_appointments': upcoming_appointments,
            'critical_stocks': critical_stocks,
            'new_users_week': new_users_week,
            'users_by_role': users_by_role,
            'requests_by_blood_type': requests_by_blood_type,
            'recent_requests': BloodRequestSerializer(recent_requests, many=True).data,
            'recent_users': recent_users,
        })


class AdminUsersView(generics.ListAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]  # Any logged-in user can search
    filter_backends = [filters.SearchFilter]
    search_fields = ['username', 'city', 'role', 'email']

    def get_queryset(self):
        return User.objects.all().order_by('-date_joined')


class NewsletterSubscribeView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email', '').strip().lower()
        if not email or '@' not in email:
            return Response({'detail': 'Please enter a valid email address.'}, status=status.HTTP_400_BAD_REQUEST)

        from .models import NewsletterSubscriber
        subscriber, created = NewsletterSubscriber.objects.get_or_create(email=email)
        if not created:
            if subscriber.is_active:
                return Response({'detail': 'already_subscribed', 'message': 'You are already subscribed!'}, status=status.HTTP_200_OK)
            else:
                subscriber.is_active = True
                subscriber.save()

        # Send confirmation email (silent fail if not configured)
        try:
            from django.core.mail import send_mail
            send_mail(
                subject='Welcome to Blood Donor Connect Alerts',
                message=f'Hi,\n\nYou have successfully subscribed to emergency blood alerts.\n\nYou will receive notifications when blood is urgently needed in your area.\n\nThank you for helping save lives!\n\nBlood Donor Connect Team',
                from_email=settings.EMAIL_HOST_USER or 'noreply@blooddonorconnect.com',
                recipient_list=[email],
                fail_silently=True,
            )
        except Exception:
            pass

        return Response({'detail': 'subscribed', 'message': 'Successfully subscribed! Check your inbox.'}, status=status.HTTP_201_CREATED)
