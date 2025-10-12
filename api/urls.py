from django.urls import path
from .views.views import hello_world
from .views.auth_views import LoginView, ProfileView
from .views.empresas_views import EmpresaAddView, EmpresaListView, EmpresaDeactivateView, EmpresaUpdateView
from .views.user_views import UserAddView, UserListView, UserUpdateView, UserDeactivateView


urlpatterns = [
    path('hello/', hello_world),
    path('login/', LoginView.as_view(), name='login'),
    path('me/', ProfileView.as_view(), name='me'),
    path('empresas/add/', EmpresaAddView.as_view(), name='empresa_add'),
    path('empresas/', EmpresaListView.as_view(), name='empresa-list'),
    path('empresas/<int:pk>/deactivate/', EmpresaDeactivateView.as_view(), name='empresa-deactivate'),
    path('empresas/<int:pk>/update/', EmpresaUpdateView.as_view(), name='empresa-update'),
    
    # URLs para usuarios
    path('users/add/', UserAddView.as_view(), name='user-add'),
    path('users/<uuid:pk>/update/', UserUpdateView.as_view(), name='user-update'),
    path('users/<uuid:pk>/deactivate/', UserDeactivateView.as_view(), name='user-deactivate'),
    path('users/', UserListView.as_view(), name='user-list'),
]
