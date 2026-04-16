from rest_framework import serializers
from .models import ChatRoom, ChatMessage
from accounts.serializers import UserProfileSerializer


class ChatMessageSerializer(serializers.ModelSerializer):
    sender = UserProfileSerializer(read_only=True)

    class Meta:
        model = ChatMessage
        fields = '__all__'
        read_only_fields = ['sender', 'created_at']


class ChatRoomSerializer(serializers.ModelSerializer):
    participants = UserProfileSerializer(many=True, read_only=True)
    last_message = ChatMessageSerializer(read_only=True)
    unread_count = serializers.SerializerMethodField()

    class Meta:
        model = ChatRoom
        fields = '__all__'

    def get_unread_count(self, obj) -> int:
        user = self.context['request'].user
        return obj.messages.filter(is_read=False).exclude(sender=user).count()
