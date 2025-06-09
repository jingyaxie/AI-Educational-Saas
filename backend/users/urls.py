from django.urls import path
from .views import LoginView, UserInfoView, SetRoleView, CaptchaView, dashboard, MemberListView, MemberDetailView, UserGroupListView, UserGroupDetailView, AgentListCreateView, AgentRetrieveUpdateDestroyView, ModelApiListCreateView, ModelApiRetrieveUpdateDestroyView, refresh_usage

urlpatterns = [
    path('login/', LoginView.as_view()),
    path('userinfo/', UserInfoView.as_view()),
    path('set_role/', SetRoleView.as_view()),
    path('captcha/', CaptchaView.as_view()),
    path('dashboard/', dashboard, name='dashboard'),
    path('users/', MemberListView.as_view(), name='member-list'),
    path('users/<int:id>/', MemberDetailView.as_view(), name='member-detail'),
    path('users/groups/', UserGroupListView.as_view(), name='group-list'),
    path('users/groups/<int:id>/', UserGroupDetailView.as_view(), name='group-detail'),
    path('agents/', AgentListCreateView.as_view(), name='agent-list'),
    path('agents/<int:id>/', AgentRetrieveUpdateDestroyView.as_view(), name='agent-detail'),
    path('modelapis/', ModelApiListCreateView.as_view(), name='modelapi-list'),
    path('modelapis/<int:id>/', ModelApiRetrieveUpdateDestroyView.as_view(), name='modelapi-detail'),
    path('modelapis/refresh_usage/', refresh_usage, name='modelapi-refresh-usage'),
] 