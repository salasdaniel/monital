from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.http import JsonResponse
from django.conf import settings
import jwt, json
from ..models import User, Empresa
import base64


@api_view(['GET'])
def hello_world(request):
    return Response({"message": "Hello from Django API!"})


def validate_app_key(request):
    key = request.headers.get('X-App-Key')
    print("App Key recibida:", key)
    print("Clave esperada:", settings.SECRET_KEY)
    if key != settings.SECRET_KEY:
        return JsonResponse({'error': 'Unauthorized app'}, status=403)
    

def validate_jwt(request):
    """Valida el token JWT y retorna el usuario autenticado"""
    auth = request.headers.get('Authorization')
    print("Header Authorization recibido:", auth)
    if not auth or not auth.startswith('Bearer '):
        return None, JsonResponse({'error': 'Token requerido'}, status=401)

    token = auth.split(' ')[1]
    try:
        decoded = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
        user_id = decoded.get('user_id')
        user = User.objects.get(id=user_id)
        return user, None
    except jwt.ExpiredSignatureError:
        return None, JsonResponse({'error': 'Token expirado por tiempo'}, status=401)
    except jwt.InvalidTokenError:
        return None, JsonResponse({'error': 'Token inválido por invalido'}, status=401)
    except User.DoesNotExist:
        return None, JsonResponse({'error': 'Usuario no encontrado'}, status=401)

def validate_basic_auth(request):
    """
    Valida la autenticación básica contra credenciales configuradas en .env
    """
    auth_header = request.headers.get('Authorization')
    
    if not auth_header or not auth_header.startswith('Basic '):
        return JsonResponse({'ok': False, 'error': 'Autenticación requerida'}, status=401)
    
    try:
        # Decodificar credenciales Base64
        encoded_credentials = auth_header.split(' ')[1]
        decoded_credentials = base64.b64decode(encoded_credentials).decode('utf-8')
        username, password = decoded_credentials.split(':', 1)
        
        # Validar contra credenciales del .env
        valid_username = settings.SHELL_API_USERNAME
        valid_password =settings.SHELL_API_PASSWORD
        
        print(f"Validando usuario: {valid_username}")
        print(f"Validando contraseña: {valid_password}")
        if username != valid_username or password != valid_password:
            return JsonResponse({'ok': False, 'error': 'Credenciales inválidas'}, status=401)
            
    except Exception as e:
        return JsonResponse({'ok': False, 'error': 'Formato de autenticación inválido'}, status=401)
    
    return None  # Autenticación exitosa