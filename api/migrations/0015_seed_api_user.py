from django.db import migrations


def create_api_user(apps, schema_editor):
    User = apps.get_model('api', 'User')
    
    # Crear usuario API si no existe
    if not User.objects.filter(username='apiUser').exists():
        User.objects.create(
            username='apiUser',
            email='null',
            name='Api',
            last_name='User',
            ruc='123',
            password=123,  # Sin contraseña
            role='admin',
            activo=True
        )
        print("✅ Usuario API creado exitosamente (username: apiUser)")
    else:
        print("ℹ️  Usuario API ya existe")


def remove_api_user(apps, schema_editor):
    """Función para revertir la migración si es necesario"""
    User = apps.get_model('api', 'User')
    User.objects.filter(username='apiUser').delete()
    print("❌ Usuario API eliminado")


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0014_matricula_venta_matricula_obj'),
    ]

    operations = [
        migrations.RunPython(create_api_user, remove_api_user),
    ]
