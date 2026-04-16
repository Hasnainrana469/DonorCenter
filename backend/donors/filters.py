import django_filters
from .models import DonorProfile


class DonorFilter(django_filters.FilterSet):
    blood_type = django_filters.CharFilter(lookup_expr='iexact')
    city = django_filters.CharFilter(field_name='user__city', lookup_expr='icontains')
    country = django_filters.CharFilter(field_name='user__country', lookup_expr='icontains')
    is_available = django_filters.BooleanFilter()
    min_rating = django_filters.NumberFilter(field_name='average_rating', lookup_expr='gte')
    min_donations = django_filters.NumberFilter(field_name='total_donations', lookup_expr='gte')

    class Meta:
        model = DonorProfile
        fields = ['blood_type', 'city', 'country', 'is_available']
