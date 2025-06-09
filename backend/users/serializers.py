from rest_framework import serializers
from .models import User, UserGroup

class UserGroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserGroup
        fields = ['id', 'name', 'modules', 'created_at']

class UserSerializer(serializers.ModelSerializer):
    group = UserGroupSerializer(read_only=True)
    group_id = serializers.PrimaryKeyRelatedField(queryset=UserGroup.objects.all(), source='group', write_only=True, required=False)

    class Meta:
        model = User
        fields = ['id', 'username', 'group', 'group_id', 'role', 'valid_until', 'date_joined', 'token_usage', 'api_key'] 