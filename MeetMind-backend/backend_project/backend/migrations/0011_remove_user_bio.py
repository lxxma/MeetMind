# Generated by Django 5.2 on 2025-05-07 18:35

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('backend', '0010_remove_room_host_remove_user_avatar_room_creator'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='user',
            name='bio',
        ),
    ]
