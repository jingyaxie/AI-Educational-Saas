from rest_framework.generics import ListAPIView
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from .models import KnowledgeSegment, KnowledgeFile
from .serializers import KnowledgeSegmentSerializer, KnowledgeFileSerializer
from rest_framework import viewsets
from rest_framework.pagination import PageNumberPagination

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

class KnowledgeFileViewSet(viewsets.ModelViewSet):
    serializer_class = KnowledgeFileSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['kb', 'enabled']
    
    def get_queryset(self):
        return KnowledgeFile.objects.all().order_by('-created')

class KnowledgeSegmentListView(ListAPIView):
    serializer_class = KnowledgeSegmentSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['file']

    def get_queryset(self):
        file_id = self.kwargs.get('file_id')
        if file_id:
            return KnowledgeSegment.objects.filter(file_id=file_id).order_by('id')
        return KnowledgeSegment.objects.all().order_by('id')

    def post(self, request, *args, **kwargs):
        # 3. 文本分段
        splitter_config = request.data.get('splitter_config', {})
        split_method = splitter_config.get('text_splitter', 'recursive')
        chunk_size = splitter_config.get('chunk_size', 1000)
        chunk_overlap = splitter_config.get('chunk_overlap', 200)
        separators = splitter_config.get('separators', ['\n\n'])

        # 保存分段内容到 KnowledgeSegment 模型
        for i, chunk in enumerate(file_content):
            KnowledgeSegment.objects.create(
                file=kf,
                content=chunk,
                tags=[],
                enabled=True
            )

        # 4. 嵌入生成
        # ... existing code ...

        return super().post(request, *args, **kwargs)

class KnowledgeSegmentViewSet(viewsets.ModelViewSet):
    serializer_class = KnowledgeSegmentSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['enabled', 'tags']
    
    def get_queryset(self):
        file_id = self.kwargs.get('file_pk')
        return KnowledgeSegment.objects.filter(file_id=file_id).order_by('id') 