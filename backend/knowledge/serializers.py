from rest_framework import serializers
from .models import KnowledgeFile, KnowledgeSegment

class KnowledgeFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = KnowledgeFile
        fields = ['id', 'filename', 'file', 'kb', 'char_count', 'created']

class KnowledgeSegmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = KnowledgeSegment
        fields = ['id', 'file', 'content', 'tags', 'enabled', 'created'] 