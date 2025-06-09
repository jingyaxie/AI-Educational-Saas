from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.contrib.auth import authenticate, login
from .models import User, UserGroup, Agent, ModelApi
from .serializers import UserSerializer, UserGroupSerializer, AgentSerializer, ModelApiSerializer
from django.contrib.auth.decorators import login_required
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from captcha.models import CaptchaStore
from captcha.helpers import captcha_image_url
from rest_framework.permissions import AllowAny
from django.urls import reverse
from rest_framework import generics, filters
from django_filters.rest_framework import DjangoFilterBackend
import logging
import requests
from django.conf import settings
from rest_framework.decorators import api_view, permission_classes

logger = logging.getLogger(__name__)

# Create your views here.

class CaptchaView(APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        try:
            print('开始生成验证码')
            new_captcha = CaptchaStore.generate_key()
            print(f'生成验证码 key: {new_captcha}')
            image_url = request.build_absolute_uri(reverse('captcha-image', kwargs={'key': new_captcha}))
            print(f'生成验证码图片 URL: {image_url}')
            return Response({
                'captcha_key': new_captcha,
                'image_url': image_url
            })
        except Exception as e:
            print(f'生成验证码时发生错误: {str(e)}')
            return Response({
                'error': '生成验证码失败',
                'detail': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class LoginView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        print('收到登录请求')
        print('请求方法:', request.method)
        print('请求头:', request.headers)
        print('请求数据:', request.data)
        username = request.data.get('username')
        password = request.data.get('password')
        captcha_key = request.data.get('captcha_key')
        captcha_value = request.data.get('captcha_value')
        print(f'登录请求：username={username}, captcha_key={captcha_key}, captcha_value={captcha_value}')
        # 校验验证码
        print('开始验证码校验')
        if not CaptchaStore.objects.filter(hashkey=captcha_key, response=captcha_value).exists():
            print('验证码错误')
            return Response({
                'error': '验证码错误',
                'detail': '请输入正确的验证码'
            }, status=status.HTTP_400_BAD_REQUEST)
        print('验证码正确，开始验证用户名密码')
        user = authenticate(request, username=username, password=password)
        if user is not None:
            print(f'用户 {username} 登录成功')
            refresh = RefreshToken.for_user(user)
            print('生成 token 成功')
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': UserSerializer(user).data
            })
        else:
            print(f'用户 {username} 登录失败：用户名或密码错误')
            return Response({'error': '用户名或密码错误'}, status=status.HTTP_401_UNAUTHORIZED)

class UserInfoView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        user = request.user
        return Response(UserSerializer(user).data)

class SetRoleView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        if request.user.role != 'admin':
            return Response({'error': '无权限'}, status=status.HTTP_403_FORBIDDEN)
        user_id = request.data.get('user_id')
        role = request.data.get('role')
        try:
            user = User.objects.get(id=user_id)
            user.role = role
            user.save()
            return Response({'msg': '角色更新成功'})
        except User.DoesNotExist:
            return Response({'error': '用户不存在'}, status=status.HTTP_404_NOT_FOUND)

@login_required
def dashboard(request):
    context = {
        'username': request.user.username,
        'student_count': 78,
        'graduate_count': 32,
        'token_usage': 109887,
        'knowledge_count': 998,
        'cloud_space_count': 876987,
    }
    return render(request, 'dashboard.html', context)

class MemberListView(generics.ListCreateAPIView):
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['group', 'role']
    search_fields = ['username']
    ordering_fields = ['date_joined', 'valid_until']

    def get_queryset(self):
        queryset = super().get_queryset()
        reg_start = self.request.query_params.get('reg_start')
        reg_end = self.request.query_params.get('reg_end')
        if reg_start:
            queryset = queryset.filter(date_joined__gte=reg_start)
        if reg_end:
            queryset = queryset.filter(date_joined__lte=reg_end)
        return queryset

class MemberDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'id'

class UserGroupListView(generics.ListCreateAPIView):
    queryset = UserGroup.objects.all().order_by('-created_at')
    serializer_class = UserGroupSerializer
    permission_classes = [IsAuthenticated]

class UserGroupDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = UserGroup.objects.all()
    serializer_class = UserGroupSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'id'

class AgentListCreateView(generics.ListCreateAPIView):
    """智能体列表与创建接口"""
    queryset = Agent.objects.all().order_by('-created')
    serializer_class = AgentSerializer
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        logger.info('获取智能体列表')
        return super().get(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        logger.info(f'创建智能体，请求数据: {request.data}')
        return super().post(request, *args, **kwargs)

class AgentRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    """智能体详情、更新、删除接口"""
    queryset = Agent.objects.all()
    serializer_class = AgentSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'id'

    def get(self, request, *args, **kwargs):
        logger.info(f'获取智能体详情: {kwargs.get("id")}')
        return super().get(request, *args, **kwargs)

    def put(self, request, *args, **kwargs):
        logger.info(f'更新智能体: {kwargs.get("id")}, 数据: {request.data}')
        return super().put(request, *args, **kwargs)

    def delete(self, request, *args, **kwargs):
        logger.info(f'删除智能体: {kwargs.get("id")}')
        return super().delete(request, *args, **kwargs)

class ModelApiListCreateView(generics.ListCreateAPIView):
    """大模型API列表与创建接口"""
    queryset = ModelApi.objects.all().order_by('-time')
    serializer_class = ModelApiSerializer
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        logger.info('获取大模型API列表')
        return super().get(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        logger.info(f'创建大模型API，请求数据: {request.data}')
        return super().post(request, *args, **kwargs)

class ModelApiRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    """大模型API详情、更新、删除接口"""
    queryset = ModelApi.objects.all()
    serializer_class = ModelApiSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'id'

    def get(self, request, *args, **kwargs):
        logger.info(f'获取大模型API详情: {kwargs.get("id")}')
        return super().get(request, *args, **kwargs)

    def put(self, request, *args, **kwargs):
        logger.info(f'更新大模型API: {kwargs.get("id")}, 数据: {request.data}')
        return super().put(request, *args, **kwargs)

    def delete(self, request, *args, **kwargs):
        logger.info(f'删除大模型API: {kwargs.get("id")}')
        return super().delete(request, *args, **kwargs)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def refresh_usage(request):
    """
    批量刷新所有大模型API的token用量（以OpenAI为例）。
    需在settings中配置 OPENAI_ORG_ID 和 OPENAI_MANAGE_KEY（有用量查询权限的key）。
    """
    from .models import ModelApi
    import datetime
    logger.info('开始批量刷新大模型API用量...')
    results = []
    for api in ModelApi.objects.all():
        usage = None
        if api.model == 'openai':
            try:
                # 查询本月用量（单位：美元，token数需换算）
                org_id = getattr(settings, 'OPENAI_ORG_ID', None)
                manage_key = getattr(settings, 'OPENAI_MANAGE_KEY', None)
                if not org_id or not manage_key:
                    logger.warning('未配置OPENAI_ORG_ID或OPENAI_MANAGE_KEY，无法查询OpenAI用量')
                    continue
                now = datetime.datetime.utcnow()
                start_date = now.replace(day=1).strftime('%Y-%m-%d')
                end_date = now.strftime('%Y-%m-%d')
                url = f'https://api.openai.com/v1/dashboard/billing/usage?start_date={start_date}&end_date={end_date}'
                headers = {
                    'Authorization': f'Bearer {api.apikey}',
                    'OpenAI-Organization': org_id
                }
                resp = requests.get(url, headers=headers, timeout=10)
                logger.info(f'OpenAI用量查询响应: {resp.status_code} {resp.text}')
                if resp.status_code == 200:
                    data = resp.json()
                    usage = data.get('total_usage', 0)
                    # OpenAI返回单位为美分，token数需结合价格换算，这里直接显示美元
                    api.usage = f"${usage/100:.2f}"
                    api.save()
                else:
                    logger.warning(f'OpenAI用量查询失败: {resp.text}')
            except Exception as e:
                logger.error(f'查询OpenAI用量异常: {e}')
        # 其它大模型可在此扩展
        results.append({
            'id': api.id,
            'model': api.model,
            'apikey': api.apikey[:8] + '...' if api.apikey else '',
            'usage': api.usage
        })
    logger.info('批量刷新大模型API用量完成')
    return Response({'results': results}, status=status.HTTP_200_OK)
