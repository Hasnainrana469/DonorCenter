import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from accounts.models import User

users_to_create = [
    {'username': 'donor_ahmed', 'email': 'ahmed@test.com', 'phone': '+923001234567', 'role': 'donor',   'city': 'Karachi',   'country': 'Pakistan'},
    {'username': 'donor_sara',  'email': 'sara@test.com',  'phone': '+923007654321', 'role': 'donor',   'city': 'Lahore',    'country': 'Pakistan'},
    {'username': 'patient_ali', 'email': 'ali@test.com',   'phone': '+923009876543', 'role': 'patient', 'city': 'Islamabad', 'country': 'Pakistan'},
]

for u in users_to_create:
    if not User.objects.filter(username=u['username']).exists():
        user = User.objects.create_user(
            username=u['username'], email=u['email'],
            phone=u['phone'], password='Test1234!',
            role=u['role'], city=u['city'], country=u['country']
        )
        print(f'Created: {user.username} ({user.role})')
    else:
        print(f'Already exists: {u["username"]}')

print(f'Total users in DB: {User.objects.count()}')
print('\nTest credentials:')
for u in users_to_create:
    print(f'  {u["username"]} / Test1234! ({u["role"]})')
