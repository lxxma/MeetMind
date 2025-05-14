from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings


from django.contrib.auth import get_user_model


class User(AbstractUser):
    email = models.EmailField(unique=True, null=True, blank=True)
    full_name = models.CharField(max_length=255, null=True, blank=True)

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email']

    # Add custom related_name to avoid clashes with auth.User fields
    groups = models.ManyToManyField(
        'auth.Group', related_name='custom_user_set', blank=True
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission', related_name='custom_user_permissions', blank=True
    )


    def __str__(self):
        return self.username
    


# Topic model
class Topic(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField(null=True, blank=True)

    def __str__(self):
        return self.name


# Room model
class Room(models.Model):
    creator = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    topic = models.ForeignKey(Topic, related_name='rooms', on_delete=models.CASCADE)  # Ensure Cascade Delete
    name = models.CharField(max_length=200)
    description = models.TextField(null=True, blank=True)
    participants = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='participants', blank=True)
    updated = models.DateTimeField(auto_now=True)
    created = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-updated', '-created']

    def __str__(self):
        return self.name


# Profile model for user-specific information
class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    bio = models.TextField(null=True, blank=True)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    full_name = models.CharField(max_length=255, null=True, blank=True)

    def __str__(self):
        return self.user.username


# Message model for messages in rooms
class Message(models.Model):
    room = models.ForeignKey(Room, related_name='messages', on_delete=models.CASCADE)
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.author} - {self.content}"


# Activity model for storing recent activities of users
class Activity(models.Model):
    user = models.ForeignKey(get_user_model(), on_delete=models.CASCADE)
    type = models.CharField(max_length=255)
    description = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.type} - {self.timestamp}"

