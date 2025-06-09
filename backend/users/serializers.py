from rest_framework import serializers
from .models import User, UserGroup, Agent, ModelApi, TokenUsage, KnowledgeFile, KnowledgeBase
from django.db import models

class UserGroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserGroup
        fields = ['id', 'name', 'modules', 'created_at']

class UserSerializer(serializers.ModelSerializer):
    group = UserGroupSerializer(read_only=True)
    group_id = serializers.PrimaryKeyRelatedField(queryset=UserGroup.objects.all(), source='group', write_only=True, required=False)
    is_active = serializers.BooleanField(required=False)

    class Meta:
        model = User
        fields = ['id', 'username', 'group', 'group_id', 'role', 'valid_until', 'date_joined', 'token_usage', 'api_key', 'is_active']

class AgentSerializer(serializers.ModelSerializer):
    """智能体序列化器，负责Agent对象的序列化与反序列化"""
    class Meta:
        model = Agent
        fields = ['id', 'name', 'apikey', 'role', 'created']

class ModelApiSerializer(serializers.ModelSerializer):
    model_display = serializers.CharField(source='get_model_display', read_only=True)
    usage = serializers.SerializerMethodField()
    class Meta:
        model = ModelApi
        fields = ['id', 'model', 'model_display', 'apikey', 'usage', 'time']
    def get_usage(self, obj):
        from .models import TokenUsage
        return TokenUsage.objects.filter(apikey=obj.apikey).aggregate(total=models.Sum('tokens'))['total'] or 0

class TokenUsageSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    agent_name = serializers.CharField(source='agent.name', read_only=True)
    class Meta:
        model = TokenUsage
        fields = ['id', 'user', 'username', 'agent', 'agent_name', 'apikey', 'tokens', 'created', 'prompt']

class KnowledgeFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = KnowledgeFile
        fields = ['id', 'filename', 'file', 'created']

class KnowledgeBaseSerializer(serializers.ModelSerializer):
    files_count = serializers.IntegerField(source='files.count', read_only=True)
    class Meta:
        model = KnowledgeBase
        fields = ['id', 'name', 'type', 'created', 'files_count'] 