from rest_framework import serializers
from .models import User, UserGroup, Agent, ModelApi, TokenUsage, KnowledgeFile, KnowledgeBase, SpaceMember, Space, SpaceDocument
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
        fields = ['id', 'model', 'model_display', 'apikey', 'usage', 'time', 'base_url', 'model_name']
    def get_usage(self, obj):
        from .models import TokenUsage
        return TokenUsage.objects.filter(apikey=obj.apikey).aggregate(total=models.Sum('tokens'))['total'] or 0

class TokenUsageSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    agent_name = serializers.CharField(source='agent.name', read_only=True)
    
    class Meta:
        model = TokenUsage
        fields = ['id', 'user', 'username', 'agent', 'agent_name', 'apikey', 'tokens', 'created', 'prompt']
        read_only_fields = ['user', 'created']
    
    def validate_tokens(self, value):
        if not value or value <= 0:
            raise serializers.ValidationError('tokens必须大于0')
        return value
    
    def validate_apikey(self, value):
        if not value:
            raise serializers.ValidationError('apikey不能为空')
        return value
    
    def create(self, validated_data):
        try:
            # 确保user字段存在
            validated_data['user'] = self.context['request'].user
            
            # 创建记录
            instance = super().create(validated_data)
            
            # 更新用户的token_usage
            user = instance.user
            user.token_usage = (user.token_usage or 0) + instance.tokens
            user.save()
            
            return instance
        except Exception as e:
            raise serializers.ValidationError(f'创建token记录失败: {str(e)}')

class KnowledgeFileSerializer(serializers.ModelSerializer):
    kb = serializers.PrimaryKeyRelatedField(queryset=KnowledgeBase.objects.all())
    
    class Meta:
        model = KnowledgeFile
        fields = ['id', 'filename', 'file', 'created', 'kb']
        extra_kwargs = {
            'kb': {'required': True}
        }

class KnowledgeBaseSerializer(serializers.ModelSerializer):
    files_count = serializers.IntegerField(source='files.count', read_only=True)
    char_count = serializers.SerializerMethodField()
    type = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    description = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    class Meta:
        model = KnowledgeBase
        fields = ['id', 'name', 'type', 'description', 'created', 'files_count', 'char_count']
    def get_char_count(self, obj):
        return sum([getattr(f, 'char_count', 0) for f in obj.files.all()])
    def create(self, validated_data):
        if not validated_data.get('type'):
            validated_data['type'] = 'doc'
        return super().create(validated_data)

class SpaceMemberSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    class Meta:
        model = SpaceMember
        fields = ['id', 'user', 'username', 'role', 'joined']

class SpaceSerializer(serializers.ModelSerializer):
    members_count = serializers.IntegerField(source='members.count', read_only=True)
    doc_count = serializers.IntegerField(source='documents.count', read_only=True)
    class Meta:
        model = Space
        fields = ['id', 'name', 'created', 'members_count', 'doc_count']

class SpaceDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = SpaceDocument
        fields = ['id', 'name', 'file', 'size', 'created'] 