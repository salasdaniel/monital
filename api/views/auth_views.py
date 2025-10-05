from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.views import View
from ..models import User
import hashlib, jwt, datetime, json
from decouple import config
from .views import validate_app_key

SECRET_KEY = config("SECRET_KEY", default="unsafe-secret")


@method_decorator(csrf_exempt, name='dispatch')
class LoginView(View):
    def post(self, request):

        #validar app_key por seguridad
        invalid = validate_app_key(request)
        if invalid:
            return invalid

        data = json.loads(request.body.decode('utf-8'))
        username = data.get('username')
        password = data.get('password')

        if not username or not password:
            return JsonResponse({'error': 'Nombre de usuario y contraseña son requeridos'}, status=400)

        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            return JsonResponse({'error': 'Nombre de usuario o contraseña inválidos'}, status=401)

        if hashlib.sha256(password.encode('utf-8')).hexdigest() != user.password:
            return JsonResponse({'error': 'Nombre de usuario o contraseña inválidos'}, status=401)

        payload = {
            'user_id': str(user.id),
            'username': user.username,
            'role': user.role,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=3),
            'iat': datetime.datetime.utcnow()
        }

        token = jwt.encode(payload, SECRET_KEY, algorithm='HS256')

        return JsonResponse({
            'access_token': token,
            'user': {'username': user.username, 'role': user.role}
        })


@method_decorator(csrf_exempt, name='dispatch')
class ProfileView(View):
    def get(self, request):
        auth = request.headers.get('Authorization')
        if not auth or not auth.startswith('Bearer '):
            return JsonResponse({'error': 'Token requerido'}, status=401)

        token = auth.split(' ')[1]
        try:
            decoded = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        except jwt.ExpiredSignatureError:
            return JsonResponse({'error': 'Token expirado'}, status=401)
        except jwt.InvalidTokenError:
            return JsonResponse({'error': 'Token inválido'}, status=401)

        return JsonResponse({'user': decoded})
