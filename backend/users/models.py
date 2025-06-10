from django.contrib.auth.models import AbstractUser
from django.db import models
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

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

class Agent(models.Model):
    name = models.CharField(max_length=64, unique=True, verbose_name='智能体名称')  # 智能体名称，唯一
    apikey = models.CharField(max_length=128, unique=True, verbose_name='API-key')  # 智能体API密钥，唯一
    role = models.CharField(max_length=128, verbose_name='可用角色')  # 智能体可用角色，逗号分隔
    created = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')  # 创建时间

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        logger.info(f'保存Agent: {self.name}, apikey: {self.apikey}, role: {self.role}')
        super().save(*args, **kwargs)

class ModelApi(models.Model):
    MODEL_CHOICES = [
        ('openai', 'OpenAI'),
        ('deepseek', 'Deepseek'),
        ('gemini', 'Gemini'),
        ('qwen', '通义千问'),
        ('moonshot', 'Moonshot'),
    ]
    model = models.CharField(max_length=32, choices=MODEL_CHOICES, verbose_name='大模型')  # 大模型类型
    apikey = models.CharField(max_length=128, unique=True, verbose_name='API-key')  # API密钥，唯一
    usage = models.CharField(max_length=64, blank=True, null=True, verbose_name='token用量')  # token用量
    time = models.DateTimeField(auto_now_add=True, verbose_name='接入时间')  # 接入时间
    base_url = models.CharField(max_length=256, blank=True, null=True, verbose_name='Base URL')  # 新增
    model_name = models.CharField(max_length=128, blank=True, null=True, verbose_name='Model Name')  # 新增

    def __str__(self):
        return f'{self.get_model_display()}'

class TokenUsage(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, verbose_name='用户')
    agent = models.ForeignKey('Agent', on_delete=models.SET_NULL, null=True, verbose_name='智能体')
    apikey = models.CharField(max_length=128, verbose_name='API-key')
    tokens = models.IntegerField(verbose_name='消耗token数')
    created = models.DateTimeField(auto_now_add=True, verbose_name='调用时间')
    prompt = models.TextField(blank=True, null=True, verbose_name='请求内容摘要')

    def __str__(self):
        return f'{self.user} {self.agent} {self.tokens} tokens @ {self.created}'

class KnowledgeBase(models.Model):
    name = models.CharField(max_length=128, unique=True, verbose_name='知识库名称')
    type = models.CharField(max_length=16, choices=[('doc', '文档'), ('xls', '表格')], verbose_name='类型')
    created = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')
    def __str__(self):
        return self.name

class KnowledgeFile(models.Model):
    kb = models.ForeignKey(KnowledgeBase, on_delete=models.CASCADE, related_name='files')
    filename = models.CharField(max_length=128, verbose_name='文件名')
    file = models.FileField(upload_to='knowledge/')
    created = models.DateTimeField(auto_now_add=True, verbose_name='上传时间')
    def __str__(self):
        return self.filename

class Space(models.Model):
    name = models.CharField(max_length=128, unique=True, verbose_name='空间名称')
    created = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')
    def __str__(self):
        return self.name

class SpaceMember(models.Model):
    space = models.ForeignKey(Space, on_delete=models.CASCADE, related_name='members')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='spaces')
    role = models.CharField(max_length=32, default='member', verbose_name='角色')
    joined = models.DateTimeField(auto_now_add=True, verbose_name='加入时间')
    class Meta:
        unique_together = ('space', 'user')
    def __str__(self):
        return f'{self.user} in {self.space} ({self.role})'

class SpaceDocument(models.Model):
    space = models.ForeignKey(Space, on_delete=models.CASCADE, related_name='documents')
    name = models.CharField(max_length=256, verbose_name='文档名')
    file = models.FileField(upload_to='space_docs/')
    size = models.CharField(max_length=32, verbose_name='文件大小')
    created = models.DateTimeField(auto_now_add=True, verbose_name='上传时间')
    def __str__(self):
        return self.name
