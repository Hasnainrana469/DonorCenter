from rest_framework import viewsets, permissions
from .models import Appointment
from .serializers import AppointmentSerializer


class AppointmentViewSet(viewsets.ModelViewSet):
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Fix: guard against AnonymousUser during schema generation
        if getattr(self, 'swagger_fake_view', False):
            return Appointment.objects.none()
        user = self.request.user
        if hasattr(user, 'role') and user.role == 'admin':
            return Appointment.objects.all()
        return Appointment.objects.filter(donor=user)
