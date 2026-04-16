from django.db import models

BLOOD_TYPES = [
    ('A+', 'A+'), ('A-', 'A-'), ('B+', 'B+'), ('B-', 'B-'),
    ('AB+', 'AB+'), ('AB-', 'AB-'), ('O+', 'O+'), ('O-', 'O-'),
]


class BloodBank(models.Model):
    name = models.CharField(max_length=200)
    address = models.TextField()
    city = models.CharField(max_length=100)
    country = models.CharField(max_length=100)
    phone = models.CharField(max_length=20)
    email = models.EmailField(blank=True)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.city}"


class BloodStock(models.Model):
    blood_bank = models.ForeignKey(BloodBank, on_delete=models.CASCADE, related_name='stocks')
    blood_type = models.CharField(max_length=5, choices=BLOOD_TYPES)
    units_available = models.FloatField(default=0)
    units_reserved = models.FloatField(default=0)
    last_updated = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['blood_bank', 'blood_type']

    @property
    def units_free(self):
        return max(0, self.units_available - self.units_reserved)

    @property
    def status(self):
        if self.units_free == 0:
            return 'critical'
        elif self.units_free < 5:
            return 'low'
        elif self.units_free < 15:
            return 'moderate'
        return 'adequate'

    def __str__(self):
        return f"{self.blood_bank.name} - {self.blood_type}: {self.units_available} units"


class StockTransaction(models.Model):
    TYPE_CHOICES = [('in', 'Stock In'), ('out', 'Stock Out'), ('reserved', 'Reserved')]

    stock = models.ForeignKey(BloodStock, on_delete=models.CASCADE, related_name='transactions')
    transaction_type = models.CharField(max_length=10, choices=TYPE_CHOICES)
    units = models.FloatField()
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.transaction_type} {self.units} units of {self.stock.blood_type}"
