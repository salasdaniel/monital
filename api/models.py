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

# Create your models here.
