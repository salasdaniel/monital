from django.http import JsonResponse
from django.db.models import Count, Sum, Q, F
from django.utils import timezone
from datetime import timedelta, datetime
from ..models import Venta, VentaDetalle, Matricula
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

        # Filtro base por empresa y rango de fechas
        ventas_filter = Q(empresa_id=empresa_id) & Q(fecha__range=[fecha_inicio, fecha_fin])

        # 1. Total Cargas (Count de Ventas)
        total_cargas = Venta.objects.filter(ventas_filter).count()

        # 2. Total Venta (Sum de total)
        total_venta = Venta.objects.filter(ventas_filter).aggregate(
            total=Sum('total')
        )['total'] or 0

        # 3. Litros Totales (Sum de cantidad de VentaDetalle)
        litros_totales = VentaDetalle.objects.filter(
            empresa_id=empresa_id,
            fecha__range=[fecha_inicio, fecha_fin]
        ).aggregate(
            total=Sum('cantidad')
        )['total'] or 0

        # 4. Total Matrículas
        total_matriculas = Matricula.objects.filter(empresa_id=empresa_id).count()

        # 5. Ventas por día (desde inicio de mes hasta hoy)
        primer_dia_mes = fecha_fin.replace(day=1)
        ventas_por_dia = []
        
        ventas_diarias = VentaDetalle.objects.filter(
            empresa_id=empresa_id,
            fecha__range=[primer_dia_mes, fecha_fin]
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
            fecha__range=[fecha_inicio, fecha_fin]
        ).aggregate(total=Sum('cantidad'))['total'] or 0
        
        total_litros_combustibles = float(total_litros_combustibles)

        combustibles = VentaDetalle.objects.filter(
            empresa_id=empresa_id,
            fecha__range=[fecha_inicio, fecha_fin]
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
                fecha__range=[fecha_inicio, fecha_fin]
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
