from django.db import models
from django.conf import settings

BLOOD_TYPES = [
    ('A+', 'A+'), ('A-', 'A-'), ('B+', 'B+'), ('B-', 'B-'),
    ('AB+', 'AB+'), ('AB-', 'AB-'), ('O+', 'O+'), ('O-', 'O-'),
]

URGENCY_LEVELS = [
    ('low', 'Low'), ('medium', 'Medium'), ('high', 'High'), ('critical', 'Critical')
]


class BloodRequest(models.Model):
    STATUS_CHOICES = [
        ('open', 'Open'), ('in_progress', 'In Progress'),
        ('fulfilled', 'Fulfilled'), ('cancelled', 'Cancelled')
    ]

    requester = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
                                   related_name='blood_requests')
    blood_type = models.CharField(max_length=5, choices=BLOOD_TYPES)
    units_needed = models.FloatField(default=1.0)
    urgency = models.CharField(max_length=10, choices=URGENCY_LEVELS, default='medium')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open')
    hospital_name = models.CharField(max_length=200)
    hospital_address = models.TextField()
    city = models.CharField(max_length=100)
    country = models.CharField(max_length=100)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    patient_name = models.CharField(max_length=200)
    contact_phone = models.CharField(max_length=20)
    description = models.TextField(blank=True)
    required_by = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.blood_type} request by {self.requester.username} - {self.urgency}"


class RequestResponse(models.Model):
    STATUS_CHOICES = [('pending', 'Pending'), ('accepted', 'Accepted'), ('rejected', 'Rejected')]

    blood_request = models.ForeignKey(BloodRequest, on_delete=models.CASCADE, related_name='responses')
    donor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    message = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['blood_request', 'donor']

    def __str__(self):
        return f"{self.donor.username} responded to {self.blood_request}"
