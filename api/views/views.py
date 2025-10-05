from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.http import JsonResponse
from django.conf import settings

@api_view(['GET'])
def hello_world(request):
    return Response({"message": "Hello from Django API!"})


def validate_app_key(request):
    key = request.headers.get('X-App-Key')
    print("App Key recibida:", key)
    print("Clave esperada:", settings.SECRET_KEY)
    if key != settings.SECRET_KEY:
        return JsonResponse({'error': 'Unauthorized app'}, status=403)
