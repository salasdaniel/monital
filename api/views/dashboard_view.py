from django.http import JsonResponse
from django.db.models import Count, Sum, Q, F
from django.utils import timezone
from datetime import timedelta, datetime
from ..models import Venta, VentaDetalle, Matricula, Empresa, User
from .views import validate_app_key, validate_jwt
from django.views import View


class DashboardView(View):
    def get(self, request):
        # Validar app_key por seguridad
        invalid = validate_app_key(request)
        if invalid:
            return invalid
        
        # Validar JWT del usuario autenticado
        user, error_response = validate_jwt(request)
        if error_response:
            return error_response

        # Obtener parámetros obligatorios
        empresa_id = request.GET.get('empresa_id')
        cant_dias = request.GET.get('cant_dias')

        if not empresa_id or not cant_dias:
            return JsonResponse(
                {'error': 'Los parámetros empresa_id y cant_dias son obligatorios'},
                status=400
            )

        try:
            cant_dias = int(cant_dias)
        except ValueError:
            return JsonResponse(
                {'error': 'cant_dias debe ser un número entero'},
                status=400
            )

        # Calcular fechas
        fecha_fin = timezone.now().date()
        fecha_inicio = fecha_fin - timedelta(days=cant_dias - 1)

        # Filtro base por empresa y rango de fechas (usando __date para incluir todo el día)
        ventas_filter = Q(empresa_id=empresa_id) & Q(fecha__date__gte=fecha_inicio) & Q(fecha__date__lte=fecha_fin)

        # 1. Total Cargas (Count de Ventas)
        total_cargas = Venta.objects.filter(ventas_filter).count()

        # 2. Total Venta (Sum de total)
        total_venta = Venta.objects.filter(ventas_filter).aggregate(
            total=Sum('total')
        )['total'] or 0

        # 3. Litros Totales (Sum de cantidad de VentaDetalle)
        litros_totales = VentaDetalle.objects.filter(
            empresa_id=empresa_id,
            fecha__date__gte=fecha_inicio,
            fecha__date__lte=fecha_fin
        ).aggregate(
            total=Sum('cantidad')
        )['total'] or 0

        # 4. Total Matrículas
        total_matriculas = Matricula.objects.filter(empresa_id=empresa_id).count()

        # 5. Ventas por día (usar el rango de fechas del filtro)
        ventas_por_dia = []
        
        ventas_diarias = VentaDetalle.objects.filter(
            empresa_id=empresa_id,
            fecha__date__gte=fecha_inicio,
            fecha__date__lte=fecha_fin
        ).values('fecha__date').annotate(
            litros=Sum('cantidad'),
            monto=Sum('subtotal')
        ).order_by('fecha__date')

        for venta_dia in ventas_diarias:
            fecha = venta_dia['fecha__date']
            ventas_por_dia.append({
                'fecha': fecha.strftime('%d %b'),
                'litros': float(venta_dia['litros'] or 0),
                'monto': float(venta_dia['monto'] or 0)
            })

        # 6. Indicadores
        # Ticket promedio
        ticket_promedio = float(total_venta) / total_cargas if total_cargas > 0 else 0

        # Litros por carga
        litros_por_carga = float(litros_totales) / total_cargas if total_cargas > 0 else 0

        # Cantidad de estaciones diferentes
        cantidad_estaciones = Venta.objects.filter(ventas_filter).values(
            'codigo_estacion'
        ).distinct().count()

        # Cantidad de matrículas diferentes que compraron
        cantidad_matriculas_activas = Venta.objects.filter(ventas_filter).values(
            'matricula'
        ).distinct().count()

        indicadores = {
            'ticket_promedio': round(ticket_promedio, 2),
            'litros_por_carga': round(litros_por_carga, 2),
            'estaciones': cantidad_estaciones,
            'matriculas': cantidad_matriculas_activas
        }

        # 7. Top Estaciones
        top_estaciones = Venta.objects.filter(ventas_filter).values(
            'codigo_estacion', 'nombre_estacion'
        ).annotate(
            cargas=Count('id'),
            monto=Sum('total')
        ).order_by('-cargas')[:8]

        top_estaciones_data = []
        for estacion in top_estaciones:
            top_estaciones_data.append({
                'estacion': estacion['nombre_estacion'] or estacion['codigo_estacion'],
                'cargas': estacion['cargas'],
                'monto': float(estacion['monto'] or 0)
            })

        # 8. Combustibles con porcentaje
        total_litros_combustibles = VentaDetalle.objects.filter(
            empresa_id=empresa_id,
            fecha__date__gte=fecha_inicio,
            fecha__date__lte=fecha_fin
        ).aggregate(total=Sum('cantidad'))['total'] or 0
        
        total_litros_combustibles = float(total_litros_combustibles)

        combustibles = VentaDetalle.objects.filter(
            empresa_id=empresa_id,
            fecha__date__gte=fecha_inicio,
            fecha__date__lte=fecha_fin
        ).values('nombre_producto').annotate(
            litros=Sum('cantidad')
        ).order_by('-litros')

        combustibles_data = []
        for combustible in combustibles:
            litros = float(combustible['litros'] or 0)
            porcentaje = (litros / total_litros_combustibles * 100) if total_litros_combustibles > 0 else 0
            combustibles_data.append({
                'nombre': combustible['nombre_producto'] or 'Sin nombre',
                'valor': round(porcentaje, 2),
                'litros': round(litros, 2)
            })

        # 9. Top Matrículas
        top_matriculas = Venta.objects.filter(ventas_filter).values(
            'matricula'
        ).annotate(
            cargas=Count('id')
        ).order_by('-cargas')[:8]

        top_matriculas_data = []
        for matricula_item in top_matriculas:
            matricula = matricula_item['matricula']
            
            # Obtener litros totales para esta matrícula
            litros = VentaDetalle.objects.filter(
                empresa_id=empresa_id,
                matricula=matricula,
                fecha__date__gte=fecha_inicio,
                fecha__date__lte=fecha_fin
            ).aggregate(total=Sum('cantidad'))['total'] or 0

            top_matriculas_data.append({
                'matricula': matricula,
                'cargas': matricula_item['cargas'],
                'litros': round(float(litros), 2)
            })

        # Respuesta
        return JsonResponse({
            'fecha_inicio': fecha_inicio.strftime('%Y-%m-%d'),
            'fecha_fin': fecha_fin.strftime('%Y-%m-%d'),
            'encabezados': {
                'total_cargas': total_cargas,
                'total_venta': float(total_venta),
                'litros_totales': float(litros_totales),
                'total_matriculas': total_matriculas
            },
            'ventas_por_periodo': ventas_por_dia,
            'indicadores': indicadores,
            'top_estaciones': top_estaciones_data,
            'combustibles': combustibles_data,
            'top_matriculas': top_matriculas_data
        }, status=200)


class AdminDashboardView(View):
    def get(self, request):
        # Validar app_key por seguridad
        invalid = validate_app_key(request)
        if invalid:
            return invalid
        
        # Validar JWT del usuario autenticado
        user, error_response = validate_jwt(request)
        if error_response:
            return error_response

        # Verificar que el usuario sea admin
        if not user or user.role != 'admin':
            return JsonResponse(
                {'error': 'No tiene permisos para acceder a este recurso'},
                status=403
            )

        # Obtener parámetro de días (obligatorio)
        cant_dias = request.GET.get('cant_dias')

        if not cant_dias:
            return JsonResponse(
                {'error': 'El parámetro cant_dias es obligatorio'},
                status=400
            )

        try:
            cant_dias = int(cant_dias)
        except ValueError:
            return JsonResponse(
                {'error': 'cant_dias debe ser un número entero'},
                status=400
            )

        # Calcular fechas
        fecha_fin = timezone.now().date()
        fecha_inicio = fecha_fin - timedelta(days=cant_dias - 1)

        # 1. KPIs del Sistema
        total_empresas = Empresa.objects.count()
        
        # Empresas con al menos una carga en el período
        empresas_activas_ids = Venta.objects.filter(
            fecha__date__gte=fecha_inicio,
            fecha__date__lte=fecha_fin
        ).values('empresa_id').distinct()
        
        empresas_activas = empresas_activas_ids.count()
        empresas_inactivas = total_empresas - empresas_activas

        # Total de usuarios
        total_usuarios = User.objects.count()
        
        # Usuarios activos (basado en el campo activo del modelo)
        usuarios_activos = User.objects.filter(activo=True).count()
        usuarios_inactivos = total_usuarios - usuarios_activos

        # Total de matrículas en el sistema
        total_matriculas_sistema = Matricula.objects.count()

        # Total de cargas en el período
        total_cargas_sistema = Venta.objects.filter(
            fecha__date__gte=fecha_inicio,
            fecha__date__lte=fecha_fin
        ).count()

        kpis_sistema = {
            'total_empresas': total_empresas,
            'empresas_activas': empresas_activas,
            'empresas_inactivas': empresas_inactivas,
            'total_usuarios': total_usuarios,
            'usuarios_activos': usuarios_activos,
            'usuarios_inactivos': usuarios_inactivos,
            'total_matriculas_sistema': total_matriculas_sistema,
            'total_cargas_sistema': total_cargas_sistema
        }

        # 2. Métricas por Empresa
        empresas = Empresa.objects.all()
        metricas_por_empresa = []

        for empresa in empresas:
            # Usuarios de la empresa
            total_usuarios_empresa = User.objects.filter(empresa_id=empresa.id).count()
            usuarios_activos_empresa = User.objects.filter(
                empresa_id=empresa.id,
                activo=True
            ).count()
            usuarios_inactivos_empresa = total_usuarios_empresa - usuarios_activos_empresa
            porcentaje_actividad = round((usuarios_activos_empresa / total_usuarios_empresa * 100), 1) if total_usuarios_empresa > 0 else 0

            # Matrículas de la empresa
            total_matriculas_empresa = Matricula.objects.filter(empresa_id=empresa.id).count()

            # Cargas de la empresa en el período
            cargas_empresa = Venta.objects.filter(
                empresa_id=empresa.id,
                fecha__date__gte=fecha_inicio,
                fecha__date__lte=fecha_fin
            )
            
            total_cargas_empresa = cargas_empresa.count()
            
            # Total venta de la empresa
            total_venta_empresa = cargas_empresa.aggregate(
                total=Sum('total')
            )['total'] or 0

            # Última carga y días de inactividad
            ultima_venta = Venta.objects.filter(empresa_id=empresa.id).order_by('-fecha').first()
            ultima_carga = ultima_venta.fecha.strftime('%Y-%m-%d') if ultima_venta else None
            dias_inactiva = (fecha_fin - ultima_venta.fecha.date()).days if ultima_venta else None

            metricas_por_empresa.append({
                'empresa_id': empresa.id,
                'empresa': empresa.razon_social,
                'ruc': empresa.ruc,
                'total_usuarios': total_usuarios_empresa,
                'usuarios_activos': usuarios_activos_empresa,
                'usuarios_inactivos': usuarios_inactivos_empresa,
                'porcentaje_actividad': porcentaje_actividad,
                'total_matriculas': total_matriculas_empresa,
                'total_cargas': total_cargas_empresa,
                'total_venta': float(total_venta_empresa),
                'dias_inactiva': dias_inactiva,
                'ultima_carga': ultima_carga
            })

        # 3. Resumen de Uso de la Plataforma
        tasa_actividad_empresas = round((empresas_activas / total_empresas * 100), 1) if total_empresas > 0 else 0
        tasa_actividad_usuarios = round((usuarios_activos / total_usuarios * 100), 1) if total_usuarios > 0 else 0
        promedio_usuarios_por_empresa = round((total_usuarios / total_empresas), 1) if total_empresas > 0 else 0
        promedio_matriculas_por_empresa = round((total_matriculas_sistema / total_empresas), 1) if total_empresas > 0 else 0
        promedio_cargas_por_empresa = round((total_cargas_sistema / empresas_activas), 1) if empresas_activas > 0 else 0

        # Empresas nuevas y inactivadas en el período
        empresas_nuevas_periodo = Empresa.objects.filter(
            created_at__date__gte=fecha_inicio,
            created_at__date__lte=fecha_fin
        ).count()

        # Empresas que estaban activas en período anterior pero no en este
        fecha_inicio_anterior = fecha_inicio - timedelta(days=cant_dias)
        fecha_fin_anterior = fecha_inicio - timedelta(days=1)
        
        empresas_activas_anterior = set(
            Venta.objects.filter(
                fecha__date__gte=fecha_inicio_anterior,
                fecha__date__lte=fecha_fin_anterior
            ).values_list('empresa_id', flat=True).distinct()
        )
        
        empresas_activas_actual = set(
            Venta.objects.filter(
                fecha__date__gte=fecha_inicio,
                fecha__date__lte=fecha_fin
            ).values_list('empresa_id', flat=True).distinct()
        )
        
        empresas_inactivadas_periodo = len(empresas_activas_anterior - empresas_activas_actual)

        resumen_uso_plataforma = {
            'tasa_actividad_empresas': tasa_actividad_empresas,
            'tasa_actividad_usuarios': tasa_actividad_usuarios,
            'promedio_usuarios_por_empresa': promedio_usuarios_por_empresa,
            'promedio_matriculas_por_empresa': promedio_matriculas_por_empresa,
            'promedio_cargas_por_empresa': promedio_cargas_por_empresa,
            'empresas_nuevas_periodo': empresas_nuevas_periodo,
            'empresas_inactivadas_periodo': empresas_inactivadas_periodo
        }

        return JsonResponse({
            'fecha_inicio': fecha_inicio.strftime('%Y-%m-%d'),
            'fecha_fin': fecha_fin.strftime('%Y-%m-%d'),
            'kpis_sistema': kpis_sistema,
            'metricas_por_empresa': metricas_por_empresa,
            'resumen_uso_plataforma': resumen_uso_plataforma
        }, status=200)
