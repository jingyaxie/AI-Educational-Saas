# Generated by Django 4.2.22 on 2025-06-09 14:36

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0003_agent'),
    ]

    operations = [
        migrations.CreateModel(
            name='ModelApi',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('model', models.CharField(choices=[('openai', 'OpenAI'), ('deepseek', 'Deepseek'), ('gemini', 'Gemini'), ('qwen', '通义千问'), ('moonshot', 'Moonshot')], max_length=32, verbose_name='大模型')),
                ('apikey', models.CharField(max_length=128, unique=True, verbose_name='API-key')),
                ('usage', models.CharField(blank=True, max_length=64, null=True, verbose_name='token用量')),
                ('time', models.DateTimeField(auto_now_add=True, verbose_name='接入时间')),
            ],
        ),
    ]
