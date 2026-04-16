from django.conf import settings
from django.core.mail import send_mail


def send_otp_sms(phone, code):
    """Send OTP via Twilio SMS"""
    try:
        from twilio.rest import Client
        client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
        client.messages.create(
            body=f"Your Blood Donor Connect OTP is: {code}. Valid for 10 minutes.",
            from_=settings.TWILIO_PHONE_NUMBER,
            to=phone
        )
    except Exception as e:
        print(f"SMS Error: {e}")


def send_otp_email(email, code):
    """Send OTP via email"""
    try:
        send_mail(
            subject='Blood Donor Connect - OTP Verification',
            message=f'Your OTP code is: {code}\nValid for 10 minutes.',
            from_email=settings.EMAIL_HOST_USER,
            recipient_list=[email],
            fail_silently=True,
        )
    except Exception as e:
        print(f"Email Error: {e}")


def send_emergency_sms(phone, message):
    """Send emergency alert via SMS"""
    try:
        from twilio.rest import Client
        client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
        client.messages.create(
            body=message,
            from_=settings.TWILIO_PHONE_NUMBER,
            to=phone
        )
    except Exception as e:
        print(f"Emergency SMS Error: {e}")
