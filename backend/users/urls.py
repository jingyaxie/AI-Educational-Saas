from django.urls import path
from .views import LoginView, UserInfoView, SetRoleView, CaptchaView

urlpatterns = [
    path('login/', LoginView.as_view()),
    path('userinfo/', UserInfoView.as_view()),
    path('set_role/', SetRoleView.as_view()),
    path('captcha/', CaptchaView.as_view()),
] 