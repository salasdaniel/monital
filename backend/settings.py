from pathlib import Path
from decouple import config



BASE_DIR = Path(__file__).resolve().parent.parent

# Seguridad
SHELL_API_USERNAME = config("SHELL_API_USERNAME", default="user")
SHELL_API_PASSWORD = config("SHELL_API_PASSWORD", default="pass")
SECRET_KEY = config("REACT_APP_SECRET_KEY", default="unsafe-secret")
DEBUG = config("DEBUG", default=True, cast=bool)
ALLOWED_HOSTS = ["*"]

# Apps instaladas
INSTALLED_APPS = [
    'django.contrib.contenttypes',  # Necesaria para migraciones y DRF
    'django.contrib.staticfiles',   # Solo para servir assets si hiciera falta
    'corsheaders',
    'rest_framework',
    'api',
]

# Middleware
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.security.SecurityMiddleware',
]

ROOT_URLCONF = 'backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
            ],
        },
    },
]

WSGI_APPLICATION = 'backend.wsgi.application'

# Base de datos
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': config("DB_NAME"),
        'USER': config("DB_USER"),
        'PASSWORD': config("DB_PASSWORD"),
        'HOST': config("DB_HOST", default="localhost"),
        'PORT': config("DB_PORT", default="5432"),
    }
}

# Configuración CORS
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "https://monital.noko.com.py"
]
# (Durante desarrollo también podrías usar)
CORS_ALLOW_ALL_ORIGINS = True

CORS_ALLOW_HEADERS = [
    'x-app-key',  # Agregar nuestro header personalizado
]

CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding', 
    'authorization',
    'content-type',  # Este es crucial
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
    'x-app-key',  # Tu header personalizado
]

# Configuración REST Framework
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [],
    'DEFAULT_PERMISSION_CLASSES': [],
}

# Usuario personalizado
# AUTH_USER_MODEL = 'api.User'

# Internacionalización
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# Archivos estáticos
STATIC_URL = 'static/'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

