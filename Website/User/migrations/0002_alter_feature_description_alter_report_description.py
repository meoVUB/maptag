# Generated by Django 4.2.7 on 2023-12-20 21:17

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("User", "0001_initial"),
    ]

    operations = [
        migrations.AlterField(
            model_name="feature",
            name="description",
            field=models.TextField(),
        ),
        migrations.AlterField(
            model_name="report",
            name="description",
            field=models.TextField(),
        ),
    ]
