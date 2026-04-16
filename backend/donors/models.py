from django.db import models
from django.conf import settings


BLOOD_TYPES = [
    ('A+', 'A+'), ('A-', 'A-'), ('B+', 'B+'), ('B-', 'B-'),
    ('AB+', 'AB+'), ('AB-', 'AB-'), ('O+', 'O+'), ('O-', 'O-'),
]


class DonorProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='donor_profile')
    blood_type = models.CharField(max_length=5, choices=BLOOD_TYPES)
    weight = models.FloatField(help_text='Weight in kg')
    age = models.IntegerField()
    is_available = models.BooleanField(default=True)
    last_donation_date = models.DateField(null=True, blank=True)
    medical_conditions = models.TextField(blank=True)
    emergency_contact = models.CharField(max_length=20, blank=True)
    total_donations = models.IntegerField(default=0)
    average_rating = models.FloatField(default=0.0)
    bio = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username} - {self.blood_type}"

    def update_rating(self):
        ratings = self.ratings.all()
        if ratings.exists():
            self.average_rating = sum(r.score for r in ratings) / ratings.count()
            self.save(update_fields=['average_rating'])


class DonorRating(models.Model):
    donor = models.ForeignKey(DonorProfile, on_delete=models.CASCADE, related_name='ratings')
    rated_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    score = models.IntegerField(choices=[(i, i) for i in range(1, 6)])
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['donor', 'rated_by']

    def __str__(self):
        return f"Rating {self.score} for {self.donor.user.username}"


class DonationHistory(models.Model):
    STATUS_CHOICES = [('completed', 'Completed'), ('pending', 'Pending'), ('cancelled', 'Cancelled')]

    donor = models.ForeignKey(DonorProfile, on_delete=models.CASCADE, related_name='donation_history')
    blood_request = models.ForeignKey('requests_app.BloodRequest', on_delete=models.SET_NULL,
                                       null=True, blank=True, related_name='donations')
    donation_date = models.DateField()
    units_donated = models.FloatField(default=1.0)
    hospital = models.CharField(max_length=200, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='completed')
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-donation_date']

    def __str__(self):
        return f"{self.donor.user.username} donated on {self.donation_date}"


class EligibilityCheck(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    age = models.IntegerField()
    weight = models.FloatField()
    last_donation_date = models.DateField(null=True, blank=True)
    has_chronic_disease = models.BooleanField(default=False)
    is_pregnant = models.BooleanField(default=False)
    recent_surgery = models.BooleanField(default=False)
    recent_tattoo = models.BooleanField(default=False)
    is_eligible = models.BooleanField(default=False)
    reason = models.TextField(blank=True)
    checked_at = models.DateTimeField(auto_now_add=True)

    def check_eligibility(self):
        reasons = []
        eligible = True

        if self.age < 18 or self.age > 65:
            eligible = False
            reasons.append("Age must be between 18 and 65.")
        if self.weight < 50:
            eligible = False
            reasons.append("Weight must be at least 50 kg.")
        if self.has_chronic_disease:
            eligible = False
            reasons.append("Chronic disease disqualifies donation.")
        if self.is_pregnant:
            eligible = False
            reasons.append("Pregnant individuals cannot donate.")
        if self.recent_surgery:
            eligible = False
            reasons.append("Recent surgery within 6 months disqualifies.")
        if self.recent_tattoo:
            eligible = False
            reasons.append("Recent tattoo within 6 months disqualifies.")
        if self.last_donation_date:
            from datetime import date
            days_since = (date.today() - self.last_donation_date).days
            if days_since < 90:
                eligible = False
                reasons.append(f"Must wait {90 - days_since} more days since last donation.")

        self.is_eligible = eligible
        self.reason = ' '.join(reasons) if reasons else "You are eligible to donate!"
        return self
