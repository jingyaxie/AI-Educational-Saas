# Generated by Django 4.2.22 on 2025-06-09 15:01

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0005_tokenusage'),
    ]

    operations = [
        migrations.CreateModel(
            name='KnowledgeBase',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=128, unique=True, verbose_name='知识库名称')),
                ('type', models.CharField(choices=[('doc', '文档'), ('xls', '表格')], max_length=16, verbose_name='类型')),
                ('created', models.DateTimeField(auto_now_add=True, verbose_name='创建时间')),
            ],
        ),
        migrations.CreateModel(
            name='KnowledgeFile',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('filename', models.CharField(max_length=128, verbose_name='文件名')),
                ('file', models.FileField(upload_to='knowledge/')),
                ('created', models.DateTimeField(auto_now_add=True, verbose_name='上传时间')),
                ('kb', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='files', to='users.knowledgebase')),
            ],
        ),
    ]
