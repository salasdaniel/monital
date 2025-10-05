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
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.username

# Create your models here.
