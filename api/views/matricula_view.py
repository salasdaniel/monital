from django.http import JsonResponse, Http404
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.views import View
from ..models import User, Matricula
import jwt, json
from decouple import config
from .views import validate_app_key, validate_jwt
from django.shortcuts import get_object_or_404


@method_decorator(csrf_exempt, name='dispatch')
class MatriculaAddView(View):
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
        required_fields = ['nro_matricula']
        missing_fields = [field for field in required_fields if not data.get(field)]
        
        if missing_fields:
            return JsonResponse({
                'error': f'Campos requeridos faltantes: {", ".join(missing_fields)}'
            }, status=400)

        # Validar que el número de matrícula no exista
        if Matricula.objects.filter(nro_matricula=data.get('nro_matricula')).exists():
            return JsonResponse({'error': 'Ya existe una matrícula con este número'}, status=400)

        try:
            # Crear la nueva matrícula
            matricula = Matricula.objects.create(
                nro_matricula=data.get('nro_matricula'),
                tracker_id=data.get('tracker_id'),
                empresa_id=data.get('empresa_id'),
                usuario_creacion=user
            )

            return JsonResponse({
                'message': 'Matrícula creada exitosamente',
                'matricula': {
                    'id': matricula.id,
                    'nro_matricula': matricula.nro_matricula,
                    'tracker_id': matricula.tracker_id,
                    'empresa_id': matricula.empresa_id,
                    'empresa_nombre': matricula.empresa.nombre_comercial if matricula.empresa else None,
                    'created_at': matricula.created_at.isoformat(),
                    'usuario_creacion': matricula.usuario_creacion.username if matricula.usuario_creacion else None
                }
            }, status=201)

        except Exception as e:
            return JsonResponse({'error': f'Error al crear la matrícula: {str(e)}'}, status=500)

        
@method_decorator(csrf_exempt, name='dispatch')
class MatriculaUpdateView(View):
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

        try:
            # Obtener la matrícula
            matricula = get_object_or_404(Matricula, id=pk)
            
            # Solo se puede actualizar el tracker_id
            if 'tracker_id' in data:
                matricula.tracker_id = data.get('tracker_id')
                matricula.save()
            else:
                return JsonResponse({
                    'error': 'No se proporcionó el campo tracker_id para actualizar'
                }, status=400)

            return JsonResponse({
                'message': 'Matrícula actualizada exitosamente',
                'matricula': {
                    'id': matricula.id,
                    'nro_matricula': matricula.nro_matricula,
                    'tracker_id': matricula.tracker_id,
                    'empresa_id': matricula.empresa_id,
                    'empresa_nombre': matricula.empresa.nombre_comercial if matricula.empresa else None,
                    'created_at': matricula.created_at.isoformat(),
                    'updated_at': matricula.updated_at.isoformat(),
                    'usuario_creacion': matricula.usuario_creacion.username if matricula.usuario_creacion else None
                }
            }, status=200)
        
        except Http404:
            return JsonResponse({'error': 'La matrícula no existe'}, status=404)

        except Exception as e:
            return JsonResponse({'error': f'Error al actualizar la matrícula: {str(e)}'}, status=500)


class MatriculaListView(View):
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
            # Obtener todas las matrículas
            matriculas = Matricula.objects.all().order_by('-created_at')
            
            # Serializar los datos
            matriculas_data = []
            for matricula in matriculas:
                matriculas_data.append({
                    'id': matricula.id,
                    'nro_matricula': matricula.nro_matricula,
                    'tracker_id': matricula.tracker_id,
                    'empresa_id': matricula.empresa_id,
                    'empresa_nombre': matricula.empresa.nombre_comercial if matricula.empresa else None,
                    'created_at': matricula.created_at.isoformat(),
                    'updated_at': matricula.updated_at.isoformat(),
                    'usuario_creacion': matricula.usuario_creacion.username if matricula.usuario_creacion else None
                })

            return JsonResponse({
                'message': 'Matrículas obtenidas exitosamente',
                'count': len(matriculas_data),
                'matriculas': matriculas_data
            }, status=200)

        except Exception as e:
            return JsonResponse({'error': f'Error al obtener las matrículas: {str(e)}'}, status=500)
