from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from .models import Notification
from accounts.utils import send_emergency_sms


def create_notification(recipient, notification_type, title, message, data=None):
    """Create a notification and push it via WebSocket"""
    notif = Notification.objects.create(
        recipient=recipient,
        notification_type=notification_type,
        title=title,
        message=message,
        data=data or {}
    )

    channel_layer = get_channel_layer()
    group_name = f'notifications_{recipient.id}'

    try:
        async_to_sync(channel_layer.group_send)(
            group_name,
            {
                'type': 'notification_message',
                'data': {
                    'id': notif.id,
                    'type': notification_type,
                    'title': title,
                    'message': message,
                    'data': data or {},
                    'created_at': str(notif.created_at),
                }
            }
        )
    except Exception as e:
        print(f"WebSocket push error: {e}")

    return notif


def send_emergency_alert_to_nearby_donors(blood_request):
    """Send emergency alerts to compatible nearby donors"""
    from donors.models import DonorProfile
    from donors.views import get_compatible_blood_types, haversine

    compatible_types = get_compatible_blood_types(blood_request.blood_type)
    donors = DonorProfile.objects.filter(
        blood_type__in=compatible_types,
        is_available=True
    ).select_related('user')

    for donor in donors:
        # Check proximity if coordinates available
        if (blood_request.latitude and blood_request.longitude and
                donor.user.latitude and donor.user.longitude):
            dist = haversine(blood_request.latitude, blood_request.longitude,
                             donor.user.latitude, donor.user.longitude)
            if dist > 50:  # Skip donors more than 50km away
                continue

        title = f"🚨 EMERGENCY: {blood_request.blood_type} Blood Needed"
        message = (f"Urgent {blood_request.blood_type} blood needed at "
                   f"{blood_request.hospital_name}, {blood_request.city}. "
                   f"Contact: {blood_request.contact_phone}")

        create_notification(donor.user, 'emergency', title, message,
                            {'request_id': blood_request.id})

        # Also send SMS for critical requests
        if blood_request.urgency == 'critical' and donor.user.phone:
            send_emergency_sms(donor.user.phone, message)
