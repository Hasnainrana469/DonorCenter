from rest_framework import viewsets, generics, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import ChatRoom, ChatMessage
from .serializers import ChatRoomSerializer, ChatMessageSerializer


class ChatRoomViewSet(viewsets.ModelViewSet):
    serializer_class = ChatRoomSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = ChatRoom.objects.none()  # Fix schema generation

    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return ChatRoom.objects.none()
        return ChatRoom.objects.filter(participants=self.request.user).prefetch_related('participants', 'messages')

    @action(detail=False, methods=['post'])
    def create_or_get(self, request):
        """Create or get a chat room with another user"""
        other_user_id = request.data.get('user_id')
        request_id = request.data.get('request_id')

        from accounts.models import User
        try:
            other_user = User.objects.get(id=other_user_id)
        except User.DoesNotExist:
            return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

        # Find existing room
        room = ChatRoom.objects.filter(
            participants=request.user
        ).filter(participants=other_user).first()

        if not room:
            room = ChatRoom.objects.create()
            room.participants.add(request.user, other_user)
            if request_id:
                from requests_app.models import BloodRequest
                try:
                    room.blood_request = BloodRequest.objects.get(id=request_id)
                    room.save()
                except BloodRequest.DoesNotExist:
                    pass

        serializer = self.get_serializer(room)
        return Response(serializer.data)

    @action(detail=True, methods=['get', 'post'])
    def messages(self, request, pk=None):
        room = self.get_object()
        if request.method == 'POST':
            content = request.data.get('content', '').strip()
            if not content:
                return Response({'error': 'Message content required.'}, status=status.HTTP_400_BAD_REQUEST)
            msg = ChatMessage.objects.create(room=room, sender=request.user, content=content)
            return Response(ChatMessageSerializer(msg).data, status=status.HTTP_201_CREATED)
        # GET
        msgs = room.messages.select_related('sender').all()
        msgs.exclude(sender=request.user).update(is_read=True)
        return Response(ChatMessageSerializer(msgs, many=True).data)



