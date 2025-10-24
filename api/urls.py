from django.urls import path
from .views.views import hello_world
from .views.auth_views import LoginView, ProfileView
from .views.empresas_views import EmpresaAddView, EmpresaListView, EmpresaDeactivateView, EmpresaUpdateView
from .views.user_views import UserAddView, UserListView, UserUpdateView, UserDeactivateView
from .views.shell_views import RegistrarVentaView, VentaListView, VentaDetalleListView
from .views.matricula_view import MatriculaListView, MatriculaUpdateView, MatriculaAddView, MatriculaImportView
from .views.dashboard_view import DashboardView



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
    
    # URLs para ventas
    path('ventas/', VentaListView.as_view(), name='venta-list'),
    path('ventas/detalle/', VentaDetalleListView.as_view(), name='venta-detalle-list'),

    # URL para Shell (integración flota)
    path('registrar/', RegistrarVentaView.as_view(), name='registrar-venta'),

    # URLs para matrículas
    path('matriculas/', MatriculaListView.as_view(), name='matricula-list'),
    path('matriculas/add/', MatriculaAddView.as_view(), name='matricula-add'),
    path('matriculas/update/<int:pk>/', MatriculaUpdateView.as_view(), name='matricula-update'),
    path('matriculas/import/', MatriculaImportView.as_view(), name='matricula-import'),
    
    # URL para dashboard
    path('dashboard/', DashboardView.as_view(), name='dashboard'),
]
