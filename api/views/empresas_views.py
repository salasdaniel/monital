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
class EmpresaAddView(View):
    def post(self, request):
        # Validar app_key por seguridad
        invalid = validate_app_key(request)
        if invalid:
            return invalid

        # Validar JWT del usuario autenticado
        user, error_response = validate_jwt(request)
        if error_response:
            return error_response

        try:
            data = json.loads(request.body.decode('utf-8'))
        except json.JSONDecodeError:
            return JsonResponse({'error': 'JSON inválido'}, status=400)

        # Validar campos requeridos
        required_fields = ['razon_social', 'nombre_comercial', 'ruc', 'direccion']
        missing_fields = [field for field in required_fields if not data.get(field)]
        
        if missing_fields:
            return JsonResponse({
                'error': f'Campos requeridos faltantes: {", ".join(missing_fields)}'
            }, status=400)

        # Validar que el RUC no exista
        if Empresa.objects.filter(ruc=data.get('ruc')).exists():
            return JsonResponse({'error': 'Ya existe una empresa con este RUC'}, status=400)

        try:
            # Crear la nueva empresa
            empresa = Empresa.objects.create(
                razon_social=data.get('razon_social'),
                nombre_comercial=data.get('nombre_comercial'),
                ruc=data.get('ruc'),
                direccion=data.get('direccion'),
                correo_referencia=data.get('correo_referencia'),
                numero_referencia=data.get('numero_referencia'),
                activo=data.get('activo', True),
                usuario_creacion=user
            )

            return JsonResponse({
                'message': 'Empresa creada exitosamente',
                'empresa': {
                    'id': empresa.id,
                    'razon_social': empresa.razon_social,
                    'nombre_comercial': empresa.nombre_comercial,
                    'ruc': empresa.ruc,
                    'direccion': empresa.direccion,
                    'correo_referencia': empresa.correo_referencia,
                    'numero_referencia': empresa.numero_referencia,
                    'activo': empresa.activo,
                    'created_at': empresa.created_at.isoformat(),
                    'usuario_creacion': empresa.usuario_creacion.username
                }
            }, status=201)

        except Exception as e:
            return JsonResponse({'error': f'Error al crear la empresa: {str(e)}'}, status=500)
class EmpresaUpdateView(View):
    def put(self, request, pk):
        # Validar app_key por seguridad
        invalid = validate_app_key(request)
        if invalid:
            return invalid

        # Validar JWT del usuario autenticado
        user, error_response = validate_jwt(request)
        if error_response:
            return error_response

        try:
            data = json.loads(request.body.decode('utf-8'))
        except json.JSONDecodeError:
            return JsonResponse({'error': 'JSON inválido'}, status=400)

        # Validar campos requeridos
        required_fields = ['razon_social', 'nombre_comercial', 'ruc', 'direccion']
        missing_fields = [field for field in required_fields if not data.get(field)]
        
        if missing_fields:
            return JsonResponse({
                'error': f'Campos requeridos faltantes: {", ".join(missing_fields)}'
            }, status=400)

        try:
            # Crear la nueva empresa
            empresa = get_object_or_404(Empresa, id=pk)
            ruc_exists = Empresa.objects.filter(ruc=data.get('ruc')).exclude(id=pk).exists()
            if ruc_exists:
                return JsonResponse({'error': 'Ya existe otra empresa con este RUC'}, status=400)
            
            empresa.razon_social = data.get('razon_social')
            empresa.nombre_comercial = data.get('nombre_comercial')
            empresa.ruc = data.get('ruc')
            empresa.direccion = data.get('direccion')
            empresa.correo_referencia = data.get('correo_referencia')
            empresa.numero_referencia = data.get('numero_referencia')
            empresa.activo = data.get('activo', empresa.activo)
            empresa.save()

            return JsonResponse({
                'message': 'Empresa actualizada exitosamente',
                'empresa': {
                    'id': empresa.id,
                    'razon_social': empresa.razon_social,
                    'nombre_comercial': empresa.nombre_comercial,
                    'ruc': empresa.ruc,
                    'direccion': empresa.direccion,
                    'correo_referencia': empresa.correo_referencia,
                    'numero_referencia': empresa.numero_referencia,
                    'activo': empresa.activo,
                    'created_at': empresa.created_at.isoformat(),
                    'updated_at': empresa.updated_at.isoformat(),
                    'usuario_creacion': empresa.usuario_creacion.username if empresa.usuario_creacion else None
                }
            }, status=200)
        
        
        except Http404:
            return JsonResponse({'error': 'La empresa no existe'}, status=404)


        except Exception as e:
            return JsonResponse({'error': f'Error al actualizar la empresa: {str(e)}'}, status=500)

class EmpresaDeactivateView(View):
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
            #encontrar la empresa y desactivarla
            empresa = get_object_or_404(Empresa, id=pk)
            empresa.activo = False
            empresa.save(update_fields=['activo'])

            return JsonResponse({
                'message': 'Empresa inactivada exitosamente',
            }, status=200)
        
        except Http404:
            return JsonResponse({'error': 'La empresa no existe'}, status=404)

        except Exception as e:
            return JsonResponse({'error': f'Error al inactivar la empresa: {str(e)}'}, status=500)

class EmpresaListView(View):
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
            # Obtener todas las empresas
            empresas = Empresa.objects.all().order_by('-created_at')
            
            # Serializar los datos
            empresas_data = []
            for empresa in empresas:
                empresas_data.append({
                    'id': empresa.id,
                    'razon_social': empresa.razon_social,
                    'nombre_comercial': empresa.nombre_comercial,
                    'ruc': empresa.ruc,
                    'direccion': empresa.direccion,
                    'correo_referencia': empresa.correo_referencia,
                    'numero_referencia': empresa.numero_referencia,
                    'activo': empresa.activo,
                    'created_at': empresa.created_at.isoformat(),
                    'updated_at': empresa.updated_at.isoformat(),
                    'usuario_creacion': empresa.usuario_creacion.username if empresa.usuario_creacion else None
                })

            return JsonResponse({
                'message': 'Empresas obtenidas exitosamente',
                'count': len(empresas_data),
                'empresas': empresas_data
            }, status=200)

        except Exception as e:
            return JsonResponse({'error': f'Error al obtener las empresas: {str(e)}'}, status=500)
