from django.db import models
import uuid

class User(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    ruc = models.CharField(max_length=13, unique=True)
    username = models.CharField(max_length=100, unique=True)
    password = models.CharField(max_length=128)
    role = models.CharField(max_length=20, choices=[('admin', 'Admin'), ('user', 'User')])
    empresa = models.ForeignKey(
        'Empresa',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="usuarios"
    )
    activo = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.username


class Empresa(models.Model):
    id = models.AutoField(primary_key=True)
    razon_social = models.CharField(max_length=255)
    nombre_comercial = models.CharField(max_length=255)
    ruc = models.CharField(max_length=13, unique=True)
    direccion = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    usuario_creacion = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name="empresas_creadas"
    )
    correo_referencia = models.EmailField(null=True, blank=True)
    numero_referencia = models.CharField(max_length=100, null=True, blank=True)
    activo = models.BooleanField(default=True)

    def __str__(self):
        return self.nombre_comercial


class Matricula(models.Model):
    id = models.AutoField(primary_key=True)
    nro_matricula = models.CharField(max_length=50, unique=True)
    cod_interno = models.CharField(max_length=100, null=True, blank=True)
    empresa = models.ForeignKey(
        'Empresa',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    usuario_creacion = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'api_matricula'
        ordering = ['-created_at']

    def __str__(self):
        return self.nro_matricula


class Venta(models.Model):
    empresa = models.ForeignKey(
        'Empresa',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="ventas",
    )
    matricula_id = models.ForeignKey(
        'Matricula',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="ventas",
        db_column='matricula_id'
    )
    tipo = models.CharField(max_length=2, null=True, blank=True)
    identificador_tr = models.CharField(max_length=100, null=True, blank=True)
    ticket = models.CharField(max_length=100, null=True, blank=True)
    fecha = models.DateTimeField(null=True, blank=True)
    codigo_cliente = models.CharField(max_length=100, null=True, blank=True)
    ruc_cliente = models.CharField(max_length=13, null=True, blank=True)
    nombre_cliente = models.CharField(max_length=255, null=True, blank=True)
    codigo_estacion = models.CharField(max_length=100, null=True, blank=True)
    nombre_estacion = models.CharField(max_length=255, null=True, blank=True)
    codigo_moneda = models.CharField(max_length=10, null=True, blank=True)
    total = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    documento_chofer = models.CharField(max_length=50, null=True, blank=True)
    nombre_chofer = models.CharField(max_length=255, null=True, blank=True)
    matricula = models.CharField(max_length=50, null=True, blank=True)  # Campo texto que viene de la API
    kilometraje = models.IntegerField(null=True, blank=True)
    tarjeta = models.CharField(max_length=50, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'api_venta'
        ordering = ['-created_at']


    def __str__(self):
        return f"Venta {self.ticket or self.id}"


class VentaLinea(models.Model):
    venta = models.ForeignKey(
        'Venta',
        on_delete=models.CASCADE,
        related_name='lineas'
    )
    codigo_producto = models.CharField(max_length=100, null=True, blank=True)
    nombre_producto = models.CharField(max_length=255, null=True, blank=True)
    precio_unitario = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    cantidad = models.DecimalField(max_digits=15, decimal_places=3, null=True, blank=True)
    subtotal = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'api_venta_linea'
        ordering = ['id']

    def __str__(self):
        return f"{self.nombre_producto} - {self.cantidad}"


# Create your models here.
