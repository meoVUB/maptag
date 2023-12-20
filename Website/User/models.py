from django.db import models

# Create your models here.

class Report(models.Model):
    description = models.TextField()

class Feature(models.Model):
    description = models.TextField()