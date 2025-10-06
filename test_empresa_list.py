import requests
import json

# Configuración
BASE_URL = "http://127.0.0.1:8000/api"
APP_KEY = "mi_secreto_super_seguro"

def test_empresa_list():
    print("=== Test del endpoint GET /api/empresas/ ===\n")
    
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
    
    # Paso 2: Obtener lista de empresas
    print("2. Obteniendo lista de empresas...")
    
    headers_with_auth = {
        "Content-Type": "application/json",
        "X-App-Key": APP_KEY,
        "Authorization": f"Bearer {token}"
    }
    
    try:
        empresas_response = requests.get(f"{BASE_URL}/empresas/", 
                                       headers=headers_with_auth)
        
        if empresas_response.status_code == 200:
            empresas_result = empresas_response.json()
            print("✅ Empresas obtenidas exitosamente!")
            print(f"Total de empresas: {empresas_result['count']}")
            print("\nEmpresas encontradas:")
            
            for i, empresa in enumerate(empresas_result['empresas'], 1):
                print(f"\n--- Empresa {i} ---")
                print(f"ID: {empresa['id']}")
                print(f"Nombre Comercial: {empresa['nombre_comercial']}")
                print(f"Razón Social: {empresa['razon_social']}")
                print(f"RUC: {empresa['ruc']}")
                print(f"Dirección: {empresa['direccion']}")
                print(f"Activo: {empresa['activo']}")
                print(f"Creado por: {empresa['usuario_creacion']}")
                print(f"Fecha creación: {empresa['created_at']}")
                
        else:
            print(f"❌ Error obteniendo empresas: {empresas_response.status_code}")
            print(f"Respuesta: {empresas_response.text}")
            
    except Exception as e:
        print(f"❌ Error conectando al servidor: {e}")

if __name__ == "__main__":
    test_empresa_list()