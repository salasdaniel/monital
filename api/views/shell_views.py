from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.views import View
from django.conf import settings
from api.models import Venta, VentaLinea, Empresa
from datetime import datetime
from decimal import Decimal
import json
from .views import validate_basic_auth





@method_decorator(csrf_exempt, name='dispatch')
class RegistrarVentaView(View):
    """
    API para registrar ventas desde solución flota
    
    Endpoint: /registrar
    Método: POST
    Seguridad: Basic Auth (Usuario y Password en el header)
    
    Parámetros de entrada:
    - tipo: VT/NC (Ventas o Notas de Crédito)
    - identificadorTr: Número único de flota
    - ticket: Número de ticket
    - fecha: Fecha de venta (formato: yyyy-MM-dd HH:mm:ss)
    - codigoCliente: Código del cliente
    - ruc: RUC del cliente
    - nombreCliente: Nombre del cliente
    - codigoEstacion: Código de la estación
    - nombreEstacion: Nombre de la estación
    - codigoMoneda: Código de moneda
    - lineas: Array de líneas de venta (DLinea)
    - total: Total de la venta
    - documentoChofer: CI del chofer
    - nombreChofer: Nombre del chofer
    - matricula: Matrícula del vehículo
    - kilometraje: Kilometraje
    - tarjeta: Número de tarjeta
    
    DLinea:
    - codigoProducto: Código del producto
    - nombreProducto: Nombre del producto
    - precioUnitario: Precio unitario
    - cantidad: Cantidad
    
    Respuesta:
    - ok: True/False
    """
    
    def post(self, request):
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
                    empresa = Empresa.objects.create(
                        razon_social=nombre_cliente,
                        nombre_comercial=nombre_cliente,
                        ruc=ruc_cliente,
                        direccion='',  # Campo vacío
                        usuario_creacion=None,
                        correo_referencia=None,
                        numero_referencia=None,
                        activo=True
                    )
                    print(f"Empresa creada automáticamente - RUC: {ruc_cliente}, Nombre: {nombre_cliente}")
            
            # Crear la venta
            venta = Venta.objects.create(
                empresa=empresa,
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
                matricula=matricula,
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
