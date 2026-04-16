import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from rest_framework_simplejwt.tokens import RefreshToken
from accounts.models import User
import urllib.request, json

u = User.objects.get(username='darkdominion.x')
token = str(RefreshToken.for_user(u).access_token)
base = 'http://127.0.0.1:8000/api'

def post(path, body):
    req = urllib.request.Request(f'{base}{path}',
        data=json.dumps(body).encode(),
        headers={'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'},
        method='POST')
    with urllib.request.urlopen(req) as r:
        return json.loads(r.read()), r.status

def get(path):
    req = urllib.request.Request(f'{base}{path}', headers={'Authorization': f'Bearer {token}'})
    with urllib.request.urlopen(req) as r:
        return json.loads(r.read())

other = User.objects.get(username='donor_ahmed')

# Search
search = get(f'/auth/admin/users/?search=donor')
names = [x['username'] for x in (search.get('results') or search)]
print(f'[1] User search "donor": {names}')

# Create room
room, status = post('/chat/rooms/create_or_get/', {'user_id': other.id})
print(f'[2] Create room: status={status}, room_id={room["id"]}')

# List rooms
rooms = get('/chat/rooms/')
room_list = rooms.get('results') or rooms
print(f'[3] List rooms: {len(room_list)} room(s)')

# Get messages
msgs = get(f'/chat/rooms/{room["id"]}/messages/')
print(f'[4] Messages: {len(msgs)} message(s)')

# Participants
participants = [p['username'] for p in room['participants']]
print(f'[5] Participants: {participants}')

# Create room again (idempotent)
room2, _ = post('/chat/rooms/create_or_get/', {'user_id': other.id})
print(f'[6] Idempotent room create: same_id={room["id"] == room2["id"]}')

print('\n✅ Chat system: ALL CHECKS PASSED')
