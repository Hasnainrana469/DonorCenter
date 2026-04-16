from rest_framework import viewsets, generics, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import DonorProfile, DonorRating, DonationHistory, EligibilityCheck
from .serializers import (DonorProfileSerializer, DonorProfileCreateSerializer,
                           DonorRatingSerializer, DonationHistorySerializer,
                           EligibilityCheckSerializer)
from .filters import DonorFilter
import math


class DonorProfileViewSet(viewsets.ModelViewSet):
    queryset = DonorProfile.objects.select_related('user').filter(user__is_active=True)
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = DonorFilter
    search_fields = ['user__city', 'user__country', 'blood_type']
    ordering_fields = ['average_rating', 'total_donations', 'created_at']

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return DonorProfileCreateSerializer
        return DonorProfileSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def nearby(self, request):
        """Find donors within a radius using Haversine formula"""
        lat = float(request.query_params.get('lat', 0))
        lng = float(request.query_params.get('lng', 0))
        radius = float(request.query_params.get('radius', 10))  # km
        blood_type = request.query_params.get('blood_type', '')

        donors = DonorProfile.objects.filter(is_available=True).select_related('user')
        if blood_type:
            donors = donors.filter(blood_type=blood_type)

        nearby = []
        for donor in donors:
            if donor.user.latitude and donor.user.longitude:
                dist = haversine(lat, lng, donor.user.latitude, donor.user.longitude)
                if dist <= radius:
                    data = DonorProfileSerializer(donor).data
                    data['distance_km'] = round(dist, 2)
                    nearby.append(data)

        nearby.sort(key=lambda x: x['distance_km'])
        return Response(nearby)

    @action(detail=False, methods=['get'])
    def ai_suggestions(self, request):
        """AI-based donor suggestions: blood type compatibility + availability + rating + recency scoring"""
        blood_type = request.query_params.get('blood_type', '')
        city = request.query_params.get('city', '')
        lat = request.query_params.get('lat')
        lng = request.query_params.get('lng')

        compatible = get_compatible_blood_types(blood_type)
        donors = DonorProfile.objects.filter(
            blood_type__in=compatible, is_available=True
        ).select_related('user')

        if city:
            donors = donors.filter(user__city__icontains=city)

        from django.utils import timezone
        import datetime

        scored = []
        for donor in donors:
            score = 0
            if donor.blood_type == blood_type:
                score += 40
            else:
                score += 20
            score += donor.average_rating * 5
            score += min(donor.total_donations * 1.5, 15)
            if donor.last_donation_date:
                days_since = (datetime.date.today() - donor.last_donation_date).days
                if days_since < 90:
                    score -= 20
                elif days_since < 180:
                    score += 5
                else:
                    score += 10
            if lat and lng and donor.user.latitude and donor.user.longitude:
                dist = haversine(float(lat), float(lng), donor.user.latitude, donor.user.longitude)
                if dist < 5:
                    score += 20
                elif dist < 15:
                    score += 10
                elif dist < 30:
                    score += 5

            data = DonorProfileSerializer(donor).data
            data['ai_score'] = round(score, 1)
            data['match_reason'] = _get_match_reason(donor, blood_type)
            scored.append(data)

        scored.sort(key=lambda x: x['ai_score'], reverse=True)
        return Response(scored[:10])


class DonorRatingViewSet(viewsets.ModelViewSet):
    queryset = DonorRating.objects.all()
    serializer_class = DonorRatingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        donor_id = self.kwargs.get('donor_pk')
        if donor_id:
            return self.queryset.filter(donor_id=donor_id)
        return self.queryset


class DonationHistoryViewSet(viewsets.ModelViewSet):
    serializer_class = DonationHistorySerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = DonationHistory.objects.none()  # Fix schema generation

    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return DonationHistory.objects.none()
        return DonationHistory.objects.filter(donor__user=self.request.user)


class EligibilityCheckView(generics.CreateAPIView):
    serializer_class = EligibilityCheckSerializer
    permission_classes = [permissions.IsAuthenticated]


def haversine(lat1, lon1, lat2, lon2):
    R = 6371
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon/2)**2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def get_compatible_blood_types(blood_type):
    compatibility = {
        'A+': ['A+', 'A-', 'O+', 'O-'],
        'A-': ['A-', 'O-'],
        'B+': ['B+', 'B-', 'O+', 'O-'],
        'B-': ['B-', 'O-'],
        'AB+': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
        'AB-': ['A-', 'B-', 'AB-', 'O-'],
        'O+': ['O+', 'O-'],
        'O-': ['O-'],
    }
    return compatibility.get(blood_type, [blood_type])


def _get_match_reason(donor, requested_type):
    reasons = []
    if donor.blood_type == requested_type:
        reasons.append(f"Exact {donor.blood_type} match")
    else:
        reasons.append(f"{donor.blood_type} is compatible with {requested_type}")
    if donor.average_rating >= 4.5:
        reasons.append("Highly rated donor")
    if donor.total_donations >= 5:
        reasons.append(f"{donor.total_donations} donations")
    return " · ".join(reasons) if reasons else "Compatible donor"
