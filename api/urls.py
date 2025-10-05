from django.urls import path
from .views.views import hello_world
from .views.auth_views import LoginView, ProfileView


urlpatterns = [
    path('hello/', hello_world),
    path('login/', LoginView.as_view(), name='login'),
    path('me/', ProfileView.as_view(), name='me'),
 
]
