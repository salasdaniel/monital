from django.contrib import admin
from .models import User, Empresa, Matricula, Venta, VentaLinea

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ['username', 'email', 'name', 'last_name', 'role', 'activo']
    search_fields = ['username', 'email', 'name']
    list_filter = ['role', 'activo']

@admin.register(Empresa)
class EmpresaAdmin(admin.ModelAdmin):
    list_display = ['nombre_comercial', 'ruc', 'activo', 'created_at']
    search_fields = ['nombre_comercial', 'ruc', 'razon_social']
    list_filter = ['activo']

@admin.register(Matricula)
class MatriculaAdmin(admin.ModelAdmin):
    list_display = ['nro_matricula', 'cod_interno', 'empresa', 'created_at']
    search_fields = ['nro_matricula', 'cod_interno']
    list_filter = ['empresa', 'created_at']
    raw_id_fields = ['empresa', 'usuario_creacion']

@admin.register(Venta)
class VentaAdmin(admin.ModelAdmin):
    list_display = ['ticket', 'fecha', 'empresa', 'matricula', 'total', 'created_at']
    search_fields = ['ticket', 'ruc_cliente', 'nombre_cliente', 'matricula']
    list_filter = ['empresa', 'created_at']
    raw_id_fields = ['empresa', 'matricula_obj']

@admin.register(VentaLinea)
class VentaLineaAdmin(admin.ModelAdmin):
    list_display = ['venta', 'nombre_producto', 'cantidad', 'precio_unitario', 'subtotal']
    search_fields = ['nombre_producto', 'codigo_producto']
    raw_id_fields = ['venta']
