from django.db import migrations
import hashlib


def create_admin_user(apps, schema_editor):
    User = apps.get_model('api', 'User')
    password = 'admin123'
    hashed_password = hashlib.sha256(password.encode('utf-8')).hexdigest()

    if not User.objects.filter(username='admin').exists():
        User.objects.create(
            username='admin',
            email='salastender@gmail.com',
            name='Daniel',
            last_name='Salas',
            ruc='8717944',
            password=hashed_password,
            role='admin',
        )
        print("Admin user created successfully (username: admin, password: admin123)")
    else:
        print(" Admin user already exists.")


class Migration(migrations.Migration):
    dependencies = [
        ('api', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(create_admin_user),
    ]
