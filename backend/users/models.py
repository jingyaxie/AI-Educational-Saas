from django.contrib.auth.models import AbstractUser
from django.db import models

# Create your models here.

class UserGroup(models.Model):
    name = models.CharField(max_length=64, unique=True, verbose_name='用户组名')
    modules = models.JSONField(default=list, verbose_name='功能模块')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')
    description = models.TextField(blank=True, null=True, verbose_name='备注说明')

    def __str__(self):
        return self.name

class User(AbstractUser):
    group = models.ForeignKey(UserGroup, on_delete=models.SET_NULL, null=True, blank=True, verbose_name='所属用户组')
    role = models.CharField(max_length=32, choices=[
        ('student', '学生'),
        ('teacher', '老师'),
        ('admin', '教务'),
        ('sysadmin', '系统管理员'),
    ], default='student', verbose_name='角色')
    valid_until = models.DateField(null=True, blank=True, verbose_name='有效期')
    token_usage = models.BigIntegerField(default=0, verbose_name='token用量')
    api_key = models.CharField(max_length=128, blank=True, null=True, verbose_name='API-key')
    # 其他字段继承自AbstractUser

    def __str__(self):
        return self.username
