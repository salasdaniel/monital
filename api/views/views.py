from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.http import JsonResponse
from django.conf import settings
import jwt, json
from ..models import User, Empresa

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

