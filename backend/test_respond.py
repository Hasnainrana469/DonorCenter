import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from rest_framework_simplejwt.tokens import RefreshToken
from accounts.models import User
from requests_app.models import BloodRequest, RequestResponse
import urllib.request, json

# Clean up previous test responses
RequestResponse.objects.all().delete()

u = User.objects.get(username='darkdominion.x')
token = str(RefreshToken.for_user(u).access_token)
req = BloodRequest.objects.filter(status='open').first()
print(f"Testing with request: {req.blood_type} at {req.hospital_name}")

def post(path, body):
    r = urllib.request.Request(
        f'http://127.0.0.1:8000/api{path}',
        data=json.dumps(body).encode(),
        headers={'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'},
        method='POST'
    )
    try:
        with urllib.request.urlopen(r) as resp:
            return resp.status, json.loads(resp.read())
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read())

# First respond — should succeed (201)
s1, d1 = post(f'/requests/{req.id}/respond/', {'message': 'I can help!'})
print(f"First respond:  {s1} — {'OK id=' + str(d1.get('id')) if s1 == 201 else d1}")

# Second respond — should return 400, NOT 500
s2, d2 = post(f'/requests/{req.id}/respond/', {'message': 'I can help!'})
print(f"Second respond: {s2} — {d2.get('detail', d2)}")

if s1 == 201 and s2 == 400:
    print("\n✅ PASS — duplicate respond returns 400, no 500 crash")
else:
    print(f"\n❌ FAIL — got {s1}, {s2}")
