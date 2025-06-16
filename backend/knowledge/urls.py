from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_nested import routers
from .views import (
    KnowledgeFileViewSet,
    KnowledgeSegmentViewSet,
)

# 创建主路由
router = DefaultRouter()
router.register(r'knowledgefiles', KnowledgeFileViewSet)

# 创建嵌套路由
nested_router = routers.NestedDefaultRouter(router, r'knowledgefiles', lookup='file')
nested_router.register(r'segments', KnowledgeSegmentViewSet, basename='file-segments')

urlpatterns = [
    path('', include(router.urls)),
    path('', include(nested_router.urls)),
] 