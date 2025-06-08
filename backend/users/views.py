from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.contrib.auth import authenticate, login
from .models import User
from .serializers import UserSerializer
from django.contrib.auth.decorators import login_required
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from captcha.models import CaptchaStore
from captcha.helpers import captcha_image_url
from rest_framework.permissions import AllowAny
from django.urls import reverse
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
