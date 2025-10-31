from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.views import View
from django.conf import settings
from api.models import Venta, VentaLinea, Empresa, Matricula, User, VentaDetalle
from datetime import datetime
from decimal import Decimal
import json
from .views import validate_basic_auth,  validate_app_key, validate_jwt
import logging




@method_decorator(csrf_exempt, name='dispatch')
class RegistrarVentaView(View):
    def post(self, request):
        # Logging del request completo
        logger = logging.getLogger("venta_logger")
        logger.info(f"Request recibido en RegistrarVentaView: body={request.body.decode('utf-8')}, headers={dict(request.headers)}")
        
        # Validar autenticación
        auth_error = validate_basic_auth(request)
        if auth_error:
            return auth_error
        
        try:
            # Parsear el body JSON
            data = json.loads(request.body.decode('utf-8'))
            
            # Extraer datos de la venta (todos los campos son opcionales/nullable)
            tipo = data.get('tipo')
            identificador_tr = data.get('identificadorTr')
            ticket = data.get('ticket')
            fecha_str = data.get('fecha')
            codigo_cliente = data.get('codigoCliente')
            ruc_cliente = data.get('ruc')
            nombre_cliente = data.get('nombreCliente')
            codigo_estacion = data.get('codigoEstacion')
            nombre_estacion = data.get('nombreEstacion')
            codigo_moneda = data.get('codigoMoneda')
            lineas = data.get('lineas', [])
            total = data.get('total')
            documento_chofer = data.get('documentoChofer')
            nombre_chofer = data.get('nombreChofer')
            matricula = data.get('matricula')
            kilometraje = data.get('kilometraje')
            tarjeta = data.get('tarjeta')
            
            # Convertir fecha si viene en formato string
            fecha = None
            if fecha_str:
                try:
                    fecha = datetime.strptime(fecha_str, '%Y-%m-%d %H:%M:%S')
                except:
                    pass  # Si no se puede parsear, se deja en None
            
            # Buscar o crear empresa por RUC (si existe)
            empresa = None
            if ruc_cliente and nombre_cliente:
                try:
                    empresa = Empresa.objects.get(ruc=ruc_cliente)
                except Empresa.DoesNotExist:
                    # Crear la empresa automáticamente con los datos disponibles
                    api_user = User.objects.get(username='apiUser')  # Usuario por defecto para creación
                    empresa = Empresa.objects.create(
                        razon_social=nombre_cliente,
                        nombre_comercial=nombre_cliente,
                        ruc=ruc_cliente,
                        direccion='',  # Campo vacío
                        usuario_creacion=api_user,
                        correo_referencia=None,
                        numero_referencia=None,
                        activo=True
                    )
                    print(f"Empresa creada automáticamente - RUC: {ruc_cliente}, Nombre: {nombre_cliente}")
            
            # Buscar o crear matrícula por nro_matricula (si existe)
            matricula_obj = None
            if matricula:
                try:
                    matricula_obj = Matricula.objects.get(nro_matricula=matricula)
                except Matricula.DoesNotExist:
                    # Crear la matrícula automáticamente vinculada a la empresa
                    api_user = User.objects.get(username='apiUser')
                    matricula_obj = Matricula.objects.create(
                        nro_matricula=matricula,
                        empresa=empresa,  # Vincular con la empresa si existe
                        usuario_creacion=api_user,
                        tracker_id=None
                    )
                    print(f"Matrícula creada automáticamente - Nro: {matricula}")
            
            # Crear la venta
            venta = Venta.objects.create(
                empresa=empresa,
                matricula_id=matricula_obj,  # Asignar la FK con el objeto Matricula
                tipo=tipo,
                identificador_tr=identificador_tr,
                ticket=ticket,
                fecha=fecha,
                codigo_cliente=codigo_cliente,
                ruc_cliente=ruc_cliente,
                nombre_cliente=nombre_cliente,
                codigo_estacion=codigo_estacion,
                nombre_estacion=nombre_estacion,
                codigo_moneda=codigo_moneda,
                total=Decimal(str(total)) if total else None,
                documento_chofer=documento_chofer,
                nombre_chofer=nombre_chofer,
                matricula=matricula,  # Campo texto original de la API
                kilometraje=kilometraje,
                tarjeta=tarjeta
            )
            
            # Procesar y guardar líneas de venta
            for linea in lineas:
                codigo_producto = linea.get('codigoProducto')
                nombre_producto = linea.get('nombreProducto')
                precio_unitario = linea.get('precioUnitario')
                cantidad = linea.get('cantidad')
                
                # Calcular subtotal
                subtotal = None
                if precio_unitario and cantidad:
                    subtotal = Decimal(str(precio_unitario)) * Decimal(str(cantidad))
                
                VentaLinea.objects.create(
                    venta=venta,
                    codigo_producto=codigo_producto,
                    nombre_producto=nombre_producto,
                    precio_unitario=Decimal(str(precio_unitario)) if precio_unitario else None,
                    cantidad=Decimal(str(cantidad)) if cantidad else None,
                    subtotal=subtotal
                )
            
            # Log para debugging
            print(f"Venta guardada - ID: {venta.id}, Ticket: {ticket}, Total: {total}")
            print(f"Cliente: {codigo_cliente} - {nombre_cliente} (ruc: {ruc_cliente})")
            print(f"Líneas guardadas: {len(lineas)}")
            
            # Respuesta exitosa
            return JsonResponse({
                'ok': True
            }, status=200)
            
        except json.JSONDecodeError:
            return JsonResponse({
                'ok': False,
                'error': 'Formato JSON inválido'
            }, status=400)
            
        except Exception as e:
            return JsonResponse({
                'ok': False,
                'error': f'Error al procesar la venta: {str(e)}'
            }, status=500)



class VentaListView(View):
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
            
            # Filtrar ventas
            if empresa_id:
                # Validar que la empresa exista
                try:
                    empresa = Empresa.objects.get(id=empresa_id)
                    ventas = Venta.objects.filter(empresa=empresa).order_by('-created_at')
                except Empresa.DoesNotExist:
                    return JsonResponse({
                        'error': 'La empresa especificada no existe'
                    }, status=400)
            else:
                # Obtener todas las ventas
                ventas = Venta.objects.all().order_by('-created_at')
            
            # Serializar los datos
            ventas_data = []
            for venta in ventas:
                # Obtener las líneas de la venta
                lineas = venta.lineas.all()
                lineas_data = []
                for linea in lineas:
                    lineas_data.append({
                        'id': linea.id,
                        'codigo_producto': linea.codigo_producto,
                        'nombre_producto': linea.nombre_producto,
                        'precio_unitario': str(linea.precio_unitario) if linea.precio_unitario else None,
                        'cantidad': str(linea.cantidad) if linea.cantidad else None,
                        'subtotal': str(linea.subtotal) if linea.subtotal else None,
                    })
                
                # Construir el objeto de venta
                venta_data = {
                    'id': venta.id,
                    'tipo': venta.tipo,
                    'identificador_tr': venta.identificador_tr,
                    'ticket': venta.ticket,
                    'fecha': venta.fecha.strftime('%Y-%m-%d %H:%M:%S') if venta.fecha else None,
                    'codigo_cliente': venta.codigo_cliente,
                    'ruc_cliente': venta.ruc_cliente,
                    'nombre_cliente': venta.nombre_cliente,
                    'codigo_estacion': venta.codigo_estacion,
                    'nombre_estacion': venta.nombre_estacion,
                    'codigo_moneda': venta.codigo_moneda,
                    'total': str(venta.total) if venta.total else None,
                    'documento_chofer': venta.documento_chofer,
                    'nombre_chofer': venta.nombre_chofer,
                    'matricula': venta.matricula,
                    'matricula_id': venta.matricula_id.id if venta.matricula_id else None,
                    'kilometraje': venta.kilometraje,
                    'tarjeta': venta.tarjeta,
                    'empresa_id': venta.empresa_id,
                    'empresa_nombre': venta.empresa.nombre_comercial if venta.empresa else None,
                    'empresa_ruc': venta.empresa.ruc if venta.empresa else None,
                    'lineas': lineas_data,
                    'created_at': venta.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                    'updated_at': venta.updated_at.strftime('%Y-%m-%d %H:%M:%S'),
                }
                
                ventas_data.append(venta_data)
            
            return JsonResponse({
                'message': 'Ventas obtenidas exitosamente',
                'count': len(ventas_data),
                'ventas': ventas_data
            }, status=200)
            
        except Exception as e:
            return JsonResponse({
                'error': f'Error al obtener las ventas: {str(e)}'
            }, status=500)


class VentaDetalleListView(View):
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
            
            # Filtrar detalles de ventas
            if empresa_id:
                # Validar que la empresa exista
                try:
                    empresa = Empresa.objects.get(id=empresa_id)
                    detalles = VentaDetalle.objects.filter(empresa_id=empresa_id)
                except Empresa.DoesNotExist:
                    return JsonResponse({
                        'error': 'La empresa especificada no existe'
                    }, status=400)
            else:
                # Obtener todos los detalles de ventas
                detalles = VentaDetalle.objects.all()
            
            # Serializar los datos
            detalles_data = []
            for detalle in detalles:
                detalle_data = {
                    'venta_id': detalle.venta_id,
                    'tipo': detalle.tipo,
                    'identificador_tr': detalle.identificador_tr,
                    'ticket': detalle.ticket,
                    'fecha': detalle.fecha.strftime('%Y-%m-%d %H:%M:%S') if detalle.fecha else None,
                    'codigo_cliente': detalle.codigo_cliente,
                    'ruc_cliente': detalle.ruc_cliente,
                    'nombre_cliente': detalle.nombre_cliente,
                    'codigo_estacion': detalle.codigo_estacion,
                    'nombre_estacion': detalle.nombre_estacion,
                    'codigo_moneda': detalle.codigo_moneda,
                    'nombre_chofer': detalle.nombre_chofer,
                    'matricula': detalle.matricula,
                    'codigo_producto': detalle.codigo_producto,
                    'nombre_producto': detalle.nombre_producto,
                    'cantidad': str(detalle.cantidad) if detalle.cantidad else None,
                    'precio_unitario': str(detalle.precio_unitario) if detalle.precio_unitario else None,
                    'subtotal': str(detalle.subtotal) if detalle.subtotal else None,
                    'empresa_id': detalle.empresa_id,
                    'matricula_id': detalle.matricula_id,
                }
                
                detalles_data.append(detalle_data)
            
            return JsonResponse({
                'message': 'Detalles de ventas obtenidos exitosamente',
                'count': len(detalles_data),
                'detalles': detalles_data
            }, status=200)
            
        except Exception as e:
            return JsonResponse({
                'error': f'Error al obtener los detalles de ventas: {str(e)}'
            }, status=500)
