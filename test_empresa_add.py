import requests
import json

# Configuración
BASE_URL = "http://127.0.0.1:8000/api"
APP_KEY = "django-insecure-0=&l*^u+)e7_d8@5)p0$0@k9u_k9n_)s@7)tnt9@7-t2=a0+2e"  # Reemplaza con tu SECRET_KEY

def test_empresa_add():
    print("=== Test del endpoint /api/empresas/add/ ===\n")
    
    # Paso 1: Login para obtener el token
    print("1. Obteniendo token de autenticación...")
    login_data = {
        "username": "admin",
        "password": "admin123"
    }
    
    headers = {
        "Content-Type": "application/json",
        "X-App-Key": APP_KEY
    }
    
    try:
        login_response = requests.post(f"{BASE_URL}/login/", 
                                     data=json.dumps(login_data), 
                                     headers=headers)
        
        if login_response.status_code == 200:
            token_data = login_response.json()
            token = token_data['access_token']
            print(f"✅ Login exitoso! Token obtenido.")
            print(f"Usuario: {token_data['user']['username']}")
            print(f"Rol: {token_data['user']['role']}\n")
        else:
            print(f"❌ Error en login: {login_response.status_code}")
            print(f"Respuesta: {login_response.text}")
            return
            
    except Exception as e:
        print(f"❌ Error conectando al servidor: {e}")
        return
    
    # Paso 2: Crear una empresa de prueba
    print("2. Creando empresa de prueba...")
    empresa_data = {
        "razon_social": "Empresa de Prueba S.A.",
        "nombre_comercial": "Prueba Corp",
        "ruc": "80123456-7",
        "direccion": "Calle Falsa 123, Ciudad de Prueba",
        "correo_referencia": "contacto@pruebacorp.com",
        "numero_referencia": "(021) 123-4567",
        "activo": True
    }
    
    headers_with_auth = {
        "Content-Type": "application/json",
        "X-App-Key": APP_KEY,
        "Authorization": f"Bearer {token}"
    }
    
    try:
        empresa_response = requests.post(f"{BASE_URL}/empresas/add/", 
                                       data=json.dumps(empresa_data), 
                                       headers=headers_with_auth)
        
        if empresa_response.status_code == 201:
            empresa_result = empresa_response.json()
            print("✅ Empresa creada exitosamente!")
            print(f"ID: {empresa_result['empresa']['id']}")
            print(f"Nombre: {empresa_result['empresa']['nombre_comercial']}")
            print(f"RUC: {empresa_result['empresa']['ruc']}")
            print(f"Usuario creación: {empresa_result['empresa']['usuario_creacion']}")
        else:
            print(f"❌ Error creando empresa: {empresa_response.status_code}")
            print(f"Respuesta: {empresa_response.text}")
            
    except Exception as e:
        print(f"❌ Error conectando al servidor: {e}")

if __name__ == "__main__":
    test_empresa_add()