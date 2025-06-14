from rest_framework import serializers
from .models import KnowledgeBase, KnowledgeFile

class KnowledgeFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = KnowledgeFile
        fields = ['id', 'filename', 'char_count', 'upload_time', 'status', 'vector_store_path']
        read_only_fields = ['id', 'char_count', 'upload_time', 'status', 'vector_store_path']

class KnowledgeBaseSerializer(serializers.ModelSerializer):
    files = KnowledgeFileSerializer(many=True, read_only=True)
    
    class Meta:
        model = KnowledgeBase
        fields = ['id', 'name', 'description', 'created_at', 'updated_at', 'files']
        read_only_fields = ['id', 'created_at', 'updated_at']

class KnowledgeFileUploadSerializer(serializers.Serializer):
    file = serializers.FileField()
    kb_id = serializers.IntegerField() 