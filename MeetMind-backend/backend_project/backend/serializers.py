from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Room
from .models import Topic
from .models import Message


User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    avatar = serializers.ImageField(required=False)
    bio = serializers.CharField(required=False)
    full_name = serializers.CharField(required=False)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'avatar', 'bio', 'full_name']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if hasattr(instance, 'profile'):
            data['avatar'] = instance.profile.avatar.url if instance.profile.avatar else None
            data['bio'] = instance.profile.bio
            data['full_name'] = instance.profile.full_name if instance.profile.full_name else ''
        return data

class RoomSerializer(serializers.ModelSerializer):
    creator = serializers.PrimaryKeyRelatedField(read_only=True)
    topic = serializers.StringRelatedField()
    participants = serializers.SerializerMethodField()

    class Meta:
        model = Room
        fields = ['id', 'creator', 'topic', 'name', 'description', 'created', 'updated', 'participants']

    def get_participants(self, obj):
        return list(obj.participants.values('id'))


class TopicSerializer(serializers.ModelSerializer):
    room_count = serializers.SerializerMethodField()

    class Meta:
        model = Topic
        fields = ['id', 'name', 'room_count']

    def get_room_count(self, obj):
        return obj.rooms.count()


class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ['id', 'author', 'content', 'created_at']

