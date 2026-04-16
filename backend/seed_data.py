import os, django, datetime
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from accounts.models import User
from donors.models import DonorProfile, DonationHistory
from requests_app.models import BloodRequest
from blood_stock.models import BloodBank, BloodStock
from appointments.models import Appointment

# ── Donors ──────────────────────────────────────────────────────────────────
donors_data = [
    {'username': 'donor_ahmed',  'blood': 'A+',  'city': 'Karachi',   'lat': 24.8607, 'lng': 67.0011, 'age': 28, 'weight': 72, 'donations': 5,  'rating': 4.8, 'phone': '+923011111101'},
    {'username': 'donor_sara',   'blood': 'B+',  'city': 'Lahore',    'lat': 31.5204, 'lng': 74.3587, 'age': 25, 'weight': 58, 'donations': 3,  'rating': 4.5, 'phone': '+923011111102'},
    {'username': 'donor_ali',    'blood': 'O+',  'city': 'Islamabad', 'lat': 33.6844, 'lng': 73.0479, 'age': 32, 'weight': 80, 'donations': 10, 'rating': 4.9, 'phone': '+923011111103'},
    {'username': 'donor_fatima', 'blood': 'AB+', 'city': 'Faisalabad','lat': 31.4504, 'lng': 73.1350, 'age': 27, 'weight': 62, 'donations': 2,  'rating': 4.2, 'phone': '+923011111104'},
    {'username': 'donor_usman',  'blood': 'O-',  'city': 'Karachi',   'lat': 24.9056, 'lng': 67.0822, 'age': 35, 'weight': 85, 'donations': 15, 'rating': 5.0, 'phone': '+923011111105'},
    {'username': 'donor_zara',   'blood': 'A-',  'city': 'Lahore',    'lat': 31.5497, 'lng': 74.3436, 'age': 23, 'weight': 55, 'donations': 1,  'rating': 4.0, 'phone': '+923011111106'},
    {'username': 'donor_hassan', 'blood': 'B-',  'city': 'Peshawar',  'lat': 34.0151, 'lng': 71.5249, 'age': 30, 'weight': 75, 'donations': 7,  'rating': 4.6, 'phone': '+923011111107'},
    {'username': 'donor_maria',  'blood': 'AB-', 'city': 'Quetta',    'lat': 30.1798, 'lng': 66.9750, 'age': 29, 'weight': 60, 'donations': 4,  'rating': 4.3, 'phone': '+923011111108'},
]

created_donors = []
for d in donors_data:
    user, _ = User.objects.get_or_create(
        username=d['username'],
        defaults={
            'email': f"{d['username']}@test.com",
            'phone': d['phone'],
            'role': 'donor',
            'city': d['city'],
            'country': 'Pakistan',
            'latitude': d['lat'],
            'longitude': d['lng'],
        }
    )
    # Update location if already exists
    if user.latitude != d['lat']:
        user.latitude = d['lat']
        user.longitude = d['lng']
        user.city = d['city']
        user.save()
    if not hasattr(user, 'password') or not user.has_usable_password():
        user.set_password('Test1234!')
        user.save()

    profile, created = DonorProfile.objects.get_or_create(
        user=user,
        defaults={
            'blood_type': d['blood'],
            'age': d['age'],
            'weight': d['weight'],
            'is_available': True,
            'total_donations': d['donations'],
            'average_rating': d['rating'],
            'bio': f"Experienced donor from {d['city']}. Happy to help save lives.",
            'last_donation_date': datetime.date.today() - datetime.timedelta(days=120),
        }
    )
    if created:
        print(f"  Created donor: {user.username} ({d['blood']}) - {d['city']}")
    else:
        # Update existing
        profile.blood_type = d['blood']
        profile.age = d['age']
        profile.weight = d['weight']
        profile.is_available = True
        profile.total_donations = d['donations']
        profile.average_rating = d['rating']
        profile.save()
        print(f"  Updated donor: {user.username} ({d['blood']}) - {d['city']}")

    # Add donation history
    if not DonationHistory.objects.filter(donor=profile).exists():
        for i in range(min(d['donations'], 3)):
            DonationHistory.objects.create(
                donor=profile,
                donation_date=datetime.date.today() - datetime.timedelta(days=120 + i*90),
                units_donated=1.0,
                hospital=f"{d['city']} General Hospital",
                status='completed',
                notes='Successful donation'
            )
    created_donors.append(profile)

# ── Blood Banks & Stock ──────────────────────────────────────────────────────
banks_data = [
    {'name': 'Karachi Blood Bank',   'city': 'Karachi',   'lat': 24.8607, 'lng': 67.0011, 'phone': '+922134567890'},
    {'name': 'Lahore Blood Center',  'city': 'Lahore',    'lat': 31.5204, 'lng': 74.3587, 'phone': '+924234567890'},
    {'name': 'Islamabad Blood Bank', 'city': 'Islamabad', 'lat': 33.6844, 'lng': 73.0479, 'phone': '+925134567890'},
]

blood_types = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
stock_levels = [25, 8, 30, 5, 12, 3, 40, 18]

for b in banks_data:
    bank, created = BloodBank.objects.get_or_create(
        name=b['name'],
        defaults={
            'address': f"123 Medical Street, {b['city']}",
            'city': b['city'], 'country': 'Pakistan',
            'phone': b['phone'], 'latitude': b['lat'], 'longitude': b['lng'],
        }
    )
    for bt, units in zip(blood_types, stock_levels):
        BloodStock.objects.get_or_create(
            blood_bank=bank, blood_type=bt,
            defaults={'units_available': units, 'units_reserved': max(0, units - 5)}
        )
    print(f"  {'Created' if created else 'Updated'} bank: {bank.name}")

# ── Blood Requests ───────────────────────────────────────────────────────────
requester = User.objects.get(username='darkdominion.x')
requests_data = [
    {'blood': 'A+',  'urgency': 'critical', 'hospital': 'Aga Khan Hospital',    'city': 'Karachi',   'units': 2, 'patient': 'Imran Khan',   'phone': '+923001234567'},
    {'blood': 'O-',  'urgency': 'high',     'hospital': 'Services Hospital',     'city': 'Lahore',    'units': 1, 'patient': 'Ayesha Malik', 'phone': '+923007654321'},
    {'blood': 'B+',  'urgency': 'medium',   'hospital': 'PIMS Hospital',         'city': 'Islamabad', 'units': 3, 'patient': 'Tariq Ahmed',  'phone': '+923009876543'},
    {'blood': 'AB+', 'urgency': 'low',      'hospital': 'Allied Hospital',       'city': 'Faisalabad','units': 1, 'patient': 'Sara Bibi',    'phone': '+923001111111'},
]

for r in requests_data:
    if not BloodRequest.objects.filter(hospital_name=r['hospital'], blood_type=r['blood']).exists():
        BloodRequest.objects.create(
            requester=requester,
            blood_type=r['blood'], urgency=r['urgency'], status='open',
            hospital_name=r['hospital'], hospital_address=f"Main Road, {r['city']}",
            city=r['city'], country='Pakistan',
            units_needed=r['units'], patient_name=r['patient'],
            contact_phone=r['phone'],
            description=f"Urgent need for {r['blood']} blood at {r['hospital']}.",
            required_by=datetime.datetime.now() + datetime.timedelta(hours=24),
        )
        print(f"  Created request: {r['blood']} at {r['hospital']} ({r['urgency']})")

print()
print("=" * 50)
print(f"✅ Donors:        {DonorProfile.objects.count()}")
print(f"✅ Blood Banks:   {BloodBank.objects.count()}")
print(f"✅ Blood Stocks:  {BloodStock.objects.count()}")
print(f"✅ Requests:      {BloodRequest.objects.count()}")
print(f"✅ Users:         {User.objects.count()}")
print()
print("Login credentials:")
print("  darkdominion.x  (patient) - your existing account")
for d in donors_data:
    print(f"  {d['username']} / Test1234! (donor - {d['blood']})")
