from django.contrib import admin
from .models import Report, Feature

# Register your models here.
@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = ('description',)  
    search_fields = ('description',) 

@admin.register(Feature)
class FeatureAdmin(admin.ModelAdmin):
    list_display = ('description',)
    search_fields = ('description',)  