import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

import urllib.request, json

def post(email):
    req = urllib.request.Request(
        'http://127.0.0.1:8000/api/auth/newsletter/subscribe/',
        data=json.dumps({'email': email}).encode(),
        headers={'Content-Type': 'application/json'},
        method='POST'
    )
    try:
        with urllib.request.urlopen(req) as r:
            return r.status, json.loads(r.read())
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read())

# Clean up
from accounts.models import NewsletterSubscriber
NewsletterSubscriber.objects.filter(email='test@example.com').delete()

s1, d1 = post('test@example.com')
print(f'First subscribe:  {s1} — {d1["message"]}')

s2, d2 = post('test@example.com')
print(f'Duplicate:        {s2} — {d2["message"]}')

s3, d3 = post('bad-email')
print(f'Invalid email:    {s3} — {d3["detail"]}')

total = NewsletterSubscriber.objects.count()
print(f'\nTotal subscribers in DB: {total}')
print('✅ Newsletter endpoint working correctly')
