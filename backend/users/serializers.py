from rest_framework import serializers
from .models import User, UserGroup, Agent, ModelApi

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
    class Meta:
        model = ModelApi
        fields = ['id', 'model', 'model_display', 'apikey', 'usage', 'time'] 