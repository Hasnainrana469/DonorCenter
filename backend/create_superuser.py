"""
Run: python create_superuser.py
Creates a default admin user for development
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from accounts.models import User

if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser(
        username='admin',
        email='admin@blooddonor.com',
        password='admin123',
        role='admin',
        city='New York',
        country='USA',
    )
    print("✅ Superuser created: admin / admin123")
else:
    print("ℹ️  Admin user already exists")
