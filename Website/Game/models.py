from django.db import models

# Create your models here.

class CustomGame(models.Model):
    DIFFICULTY_CHOICES = [
        ('Impossible', 'impossible'),
        ('Very Hard', 'very_hard'),
        ('Hard', 'hard'),
        ('Normal', 'normal'),
        ('Easy', 'easy'),
    ]
    creator = models.CharField(max_length=255)
    likes = models.IntegerField(default=0)
    date_created = models.DateTimeField(auto_now_add=True)
    map_title = models.CharField(max_length=100)
    mobility = models.BooleanField(default=False)
    difficulty = models.CharField(max_length = 20, choices = DIFFICULTY_CHOICES)
    timer_status = models.BooleanField(default=False)
    timer_duration = models.IntegerField(null=True, blank=True)
    map_description = models.TextField(default="No description.", max_length=1000)
    
class Location(models.Model):
    custom_game = models.ForeignKey(CustomGame, related_name='locations', on_delete=models.CASCADE)
    latitude = models.FloatField()
    longitude = models.FloatField()