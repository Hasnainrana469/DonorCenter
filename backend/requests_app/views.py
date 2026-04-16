from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import BloodRequest, RequestResponse
from .serializers import BloodRequestSerializer, RequestResponseSerializer
from notifications.tasks import send_emergency_alert_to_nearby_donors


class BloodRequestViewSet(viewsets.ModelViewSet):
    queryset = BloodRequest.objects.select_related('requester').all()
    serializer_class = BloodRequestSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['blood_type', 'urgency', 'status', 'city', 'country']
    search_fields = ['hospital_name', 'city', 'blood_type']
    ordering_fields = ['created_at', 'urgency', 'required_by']

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        request_obj = serializer.save()
        # Trigger emergency alerts for critical requests
        if request_obj.urgency == 'critical':
            send_emergency_alert_to_nearby_donors(request_obj)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def respond(self, request, pk=None):
        blood_request = self.get_object()

        # Check if already responded
        if blood_request.responses.filter(donor=request.user).exists():
            return Response(
                {'detail': 'You have already responded to this request.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = RequestResponseSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save(blood_request=blood_request)

        # Notify the requester
        from notifications.tasks import create_notification
        create_notification(
            recipient=blood_request.requester,
            notification_type='request_response',
            title=f'New response to your {blood_request.blood_type} request',
            message=f'{request.user.username} has offered to donate blood at {blood_request.hospital_name}.',
            data={'request_id': blood_request.id, 'donor_id': request.user.id}
        )

        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get'])
    def responses(self, request, pk=None):
        blood_request = self.get_object()
        responses = blood_request.responses.select_related('donor').all()
        serializer = RequestResponseSerializer(responses, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def my_requests(self, request):
        qs = self.queryset.filter(requester=request.user)
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)


class RequestResponseViewSet(viewsets.ModelViewSet):
    queryset = RequestResponse.objects.all()
    serializer_class = RequestResponseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return self.queryset.filter(donor=self.request.user)
