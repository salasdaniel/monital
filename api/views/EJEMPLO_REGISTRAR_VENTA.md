# Ejemplo de cómo probar la API de Registro de Venta

## 📍 Endpoint
POST /api/registrar/

## 🔐 Autenticación
Basic Auth - Usuario y Password en el header Authorization

## 📋 Ejemplo de petición con curl:

```bash
curl -X POST http://localhost:8000/api/registrar/ \
  -H "Authorization: Basic dXNlcm5hbWU6cGFzc3dvcmQ=" \
  -H "Content-Type: application/json" \
  -d '{
    "tipo": "VT",
    "identificadorTr": "12345",
    "ticket": "TK-001",
    "fecha": "2025-10-12 14:30:00",
    "codigoCliente": "CLI-001",
    "rut": "12345678-9",
    "nombreCliente": "Cliente Ejemplo S.A.",
    "codigoEstacion": "EST-001",
    "nombreEstacion": "Estación Central",
    "codigoMoneda": "UYU",
    "lineas": [
      {
        "codigoProducto": "PROD-001",
        "nombreProducto": "Gasolina Super",
        "precioUnitario": 45.50,
        "cantidad": 30
      },
      {
        "codigoProducto": "PROD-002",
        "nombreProducto": "Diesel",
        "precioUnitario": 42.00,
        "cantidad": 20
      }
    ],
    "total": 2205.00,
    "documentoChofer": "11223344",
    "nombreChofer": "Juan Pérez",
    "matricula": "ABC-1234",
    "kilometraje": 150000,
    "tarjeta": "1234567890123456"
  }'
```

## 📋 Ejemplo con Python requests:

```python
import requests
import base64

# Codificar credenciales en Base64
username = "usuario"
password = "contraseña"
credentials = f"{username}:{password}"
encoded_credentials = base64.b64encode(credentials.encode()).decode()

url = "http://localhost:8000/api/registrar/"
headers = {
    "Authorization": f"Basic {encoded_credentials}",
    "Content-Type": "application/json"
}

data = {
    "tipo": "VT",
    "identificadorTr": "12345",
    "ticket": "TK-001",
    "fecha": "2025-10-12 14:30:00",
    "codigoCliente": "CLI-001",
    "rut": "12345678-9",
    "nombreCliente": "Cliente Ejemplo S.A.",
    "codigoEstacion": "EST-001",
    "nombreEstacion": "Estación Central",
    "codigoMoneda": "UYU",
    "lineas": [
        {
            "codigoProducto": "PROD-001",
            "nombreProducto": "Gasolina Super",
            "precioUnitario": 45.50,
            "cantidad": 30
        }
    ],
    "total": 1365.00,
    "documentoChofer": "11223344",
    "nombreChofer": "Juan Pérez",
    "matricula": "ABC-1234",
    "kilometraje": 150000,
    "tarjeta": "1234567890123456"
}

response = requests.post(url, headers=headers, json=data)
print(response.status_code)
print(response.json())
```

## ✅ Respuesta Exitosa (200):
```json
{
  "ok": true
}
```

## ❌ Respuesta Error de Autenticación (401):
```json
{
  "ok": false,
  "error": "Autenticación requerida"
}
```

## ❌ Respuesta Error de Formato (400):
```json
{
  "ok": false,
  "error": "Formato JSON inválido"
}
```

## 📝 Notas:
- Todos los campos son opcionales (nullable)
- El tipo puede ser "VT" (Venta) o "NC" (Nota de Crédito)
- La fecha debe estar en formato: yyyy-MM-dd HH:mm:ss
- Las líneas es un array que puede contener múltiples productos
- Por ahora, la API siempre responde con ok: true y código 200
- La validación de credenciales está pendiente de implementación completa
