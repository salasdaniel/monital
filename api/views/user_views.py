from django.http import JsonResponse, Http404
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.views import View
from ..models import User, Empresa
import jwt, json
from decouple import config
from .views import validate_app_key, validate_jwt
from django.shortcuts import get_object_or_404





@method_decorator(csrf_exempt, name='dispatch')
class UserAddView(View):
    def post(self, request):
       
        invalid = validate_app_key(request)
        if invalid:
            return invalid

        admin_user, error_response = validate_jwt(request)
        if error_response:
            return error_response

        try:
            data = json.loads(request.body.decode('utf-8'))
        except json.JSONDecodeError:
            return JsonResponse({'error': 'JSON inválido'}, status=400)

        # Validar campos requeridos
        required_fields = ['email', 'name', 'last_name', 'ruc', 'username', 'password', 'role', 'empresa_id']
        missing_fields = [field for field in required_fields if not data.get(field)]
        
        if missing_fields:
            return JsonResponse({
                'error': f'Campos requeridos faltantes: {", ".join(missing_fields)}'
            }, status=400)

        # Validar que el email no exista
        if User.objects.filter(email=data.get('email')).exists():
            return JsonResponse({'error': 'Ya existe un usuario con este email'}, status=400)

        # Validar que el username no exista
        if User.objects.filter(username=data.get('username')).exists():
            return JsonResponse({'error': 'Ya existe un usuario con este nombre de usuario'}, status=400)

        # Validar que el RUC no exista
        if User.objects.filter(ruc=data.get('ruc')).exists():
            return JsonResponse({'error': 'Ya existe un usuario con este RUC'}, status=400)

        # Validar que el role sea válido
        if data.get('role') not in ['admin', 'user']:
            return JsonResponse({'error': 'El rol debe ser "admin" o "user"'}, status=400)

        try:
            import hashlib
            
            # Si se proporciona empresa_id, validar que exista
            empresa = None
            if data.get('empresa_id'):
                try:
                    empresa = Empresa.objects.get(id=data.get('empresa_id'))
                except Empresa.DoesNotExist:
                    return JsonResponse({'error': 'La empresa especificada no existe'}, status=400)

            # Crear el nuevo usuario
            new_user = User.objects.create(
                email=data.get('email'),
                name=data.get('name'),
                last_name=data.get('last_name'),
                ruc=data.get('ruc'),
                username=data.get('username'),
                password=hashlib.sha256(data.get('password').encode('utf-8')).hexdigest(),
                role=data.get('role'),
                empresa=empresa
            )

            return JsonResponse({
                'message': 'Usuario creado exitosamente',
                'user': {
                    'id': str(new_user.id),
                    'email': new_user.email,
                    'name': new_user.name,
                    'last_name': new_user.last_name,
                    'ruc': new_user.ruc,
                    'username': new_user.username,
                    'role': new_user.role,
                    'empresa_id': new_user.empresa.id if new_user.empresa else None,
                    'empresa_nombre': new_user.empresa.nombre_comercial if new_user.empresa else None,
                    'created_at': new_user.created_at.isoformat()
                }
            }, status=201)

        except Exception as e:
            return JsonResponse({'error': f'Error al crear el usuario: {str(e)}'}, status=500)
    
class UserUpdateView(View):
    def put(self, request, pk):
        # Validar app_key por seguridad
        invalid = validate_app_key(request)
        if invalid:
            return invalid

        # Validar JWT del usuario autenticado
        admin_user, error_response = validate_jwt(request)
        if error_response:
            return error_response

        try:
            data = json.loads(request.body.decode('utf-8'))
        except json.JSONDecodeError:
            return JsonResponse({'error': 'JSON inválido'}, status=400)

        # Validar campos requeridos (password es opcional en update)
        required_fields = ['email', 'name', 'last_name', 'ruc', 'username', 'role', 'empresa_id']
        missing_fields = [field for field in required_fields if not data.get(field)]
        
        if missing_fields:
            return JsonResponse({
                'error': f'Campos requeridos faltantes: {", ".join(missing_fields)}'
            }, status=400)

        try:
            # Buscar el usuario por ID
            user = get_object_or_404(User, id=pk)
            
            # Validar que el email no exista en otro usuario (excepto el actual)
            email_exists = User.objects.filter(email=data.get('email')).exclude(id=pk).exists()
            if email_exists:
                return JsonResponse({'error': 'Ya existe otro usuario con este email'}, status=400)
            
            # Validar que el username no exista en otro usuario (excepto el actual)
            username_exists = User.objects.filter(username=data.get('username')).exclude(id=pk).exists()
            if username_exists:
                return JsonResponse({'error': 'Ya existe otro usuario con este nombre de usuario'}, status=400)
            
            # Validar que el RUC no exista en otro usuario (excepto el actual)
            ruc_exists = User.objects.filter(ruc=data.get('ruc')).exclude(id=pk).exists()
            if ruc_exists:
                return JsonResponse({'error': 'Ya existe otro usuario con este RUC'}, status=400)
            
            # Validar que el role sea válido
            if data.get('role') not in ['admin', 'user']:
                return JsonResponse({'error': 'El rol debe ser "admin" o "user"'}, status=400)
            
            # Si se proporciona empresa_id, validar que exista
            empresa = None
            if data.get('empresa_id'):
                try:
                    empresa = Empresa.objects.get(id=data.get('empresa_id'))
                except Empresa.DoesNotExist:
                    return JsonResponse({'error': 'La empresa especificada no existe'}, status=400)
            
            # Actualizar los campos del usuario
            user.email = data.get('email')
            user.name = data.get('name')
            user.last_name = data.get('last_name')
            user.ruc = data.get('ruc')
            user.username = data.get('username')
            user.role = data.get('role')
            user.empresa = empresa
            
            # Actualizar contraseña solo si se proporciona
            if data.get('password'):
                import hashlib
                user.password = hashlib.sha256(data.get('password').encode('utf-8')).hexdigest()
            
            user.save()

            return JsonResponse({
                'message': 'Usuario actualizado exitosamente',
                'user': {
                    'id': str(user.id),
                    'email': user.email,
                    'name': user.name,
                    'last_name': user.last_name,
                    'ruc': user.ruc,
                    'username': user.username,
                    'role': user.role,
                    'empresa_id': user.empresa.id if user.empresa else None,
                    'empresa_nombre': user.empresa.nombre_comercial if user.empresa else None,
                    'created_at': user.created_at.isoformat()
                }
            }, status=200)
        
        except Http404:
            return JsonResponse({'error': 'El usuario no existe'}, status=404)

        except Exception as e:
            return JsonResponse({'error': f'Error al actualizar el usuario: {str(e)}'}, status=500)

class UserDeactivateView(View):
    def patch(self, request, pk):
        # Validar app_key por seguridad
        invalid = validate_app_key(request)
        if invalid:
            return invalid

        # Validar JWT del usuario autenticado
        user, error_response = validate_jwt(request)
        if error_response:
            return error_response
        
        try:
            # Parsear el body del request
            data = json.loads(request.body.decode('utf-8'))
        except json.JSONDecodeError:
            return JsonResponse({'error': 'JSON inválido'}, status=400)

        try:
            # Encontrar el usuario y cambiar su estado
            usuario = get_object_or_404(User, id=pk)
            nuevo_estado = bool(data.get('activo'))

            if nuevo_estado:
                usuario.activo = False
                usuario.save(update_fields=['activo'])

                return JsonResponse({
                    'message': 'Usuario inactivado exitosamente',
                }, status=200)
            
            else:
                usuario.activo = True
                usuario.save(update_fields=['activo'])
                return JsonResponse({
                    'message': 'Usuario activado exitosamente',
                }, status=200)

        except Http404:
            return JsonResponse({'error': 'El usuario no existe'}, status=404)

        except Exception as e:
            return JsonResponse({'error': f'Error al cambiar el estado del usuario: {str(e)}'}, status=500)

class UserListView(View):
    def get(self, request):
        # Validar app_key por seguridad
        invalid = validate_app_key(request)
        if invalid:
            return invalid

        # Validar JWT del usuario autenticado
        user, error_response = validate_jwt(request)
        if error_response:
            return error_response

        try:
            # Obtener el parámetro opcional empresa_id desde query string
            empresa_id = request.GET.get('empresa_id')
            print("empresa_id recibido:", empresa_id)
            
            # Filtrar usuarios
            if empresa_id:
                # Validar que la empresa exista
                try:
                    empresa = Empresa.objects.get(id=empresa_id)
                    usuarios = User.objects.filter(empresa=empresa).order_by('-created_at')
                except Empresa.DoesNotExist:
                    return JsonResponse({'error': 'La empresa especificada no existe'}, status=400)
            else:
                # Obtener todos los usuarios (cuando no se proporciona empresa_id)
                usuarios = User.objects.all().order_by('-created_at')
            
            # Serializar los datos
            usuarios_data = []
            for usuario in usuarios:
                usuarios_data.append({
                    'id': str(usuario.id),
                    'email': usuario.email,
                    'name': usuario.name,
                    'last_name': usuario.last_name,
                    'ruc': usuario.ruc,
                    'username': usuario.username,
                    'role': usuario.role,
                    'empresa_id': usuario.empresa.id if usuario.empresa else None,
                    'empresa_nombre': usuario.empresa.nombre_comercial if usuario.empresa else None,
                    'activo': usuario.activo,
                    'created_at': usuario.created_at.isoformat(),
                })

            return JsonResponse({
                'message': 'Usuarios obtenidos exitosamente',
                'count': len(usuarios_data),
                'usuarios': usuarios_data
            }, status=200)

        except Exception as e:
            return JsonResponse({'error': f'Error al obtener los usuarios: {str(e)}'}, status=500)

