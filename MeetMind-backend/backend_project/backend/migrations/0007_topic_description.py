# Generated by Django 5.2 on 2025-05-07 11:34

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('backend', '0006_alter_room_topic'),
    ]

    operations = [
        migrations.AddField(
            model_name='topic',
            name='description',
            field=models.TextField(blank=True, null=True),
        ),
    ]
