from django.contrib import admin
from .models import CustomGame, Location

# Register your models here.
@admin.register(CustomGame)
class CustomGameAdmin(admin.ModelAdmin):
    list_display = ('creator', 'map_title', 'date_created', 'mobility', 'difficulty', 'timer_status', 'timer_duration')

@admin.register(Location)
class LocationAdmin(admin.ModelAdmin):
    list_display = ('custom_game', 'latitude', 'longitude')