# Importación de Matrículas desde Excel

## Endpoint
**POST** `/api/matriculas/import/`

## Autenticación
- Header: `Authorization: Bearer {token}`
- Header: `X-App-Key: {app_key}`

## Formato del Archivo

El archivo debe ser un **archivo Excel (.xlsx)** con la siguiente estructura:

| matricula | tracker_id |
|-----------|------------|
| ABC-1234  | TRACK-001  |
| XYZ-5678  | TRACK-002  |
| DEF-9012  | TRACK-003  |

### Columnas:
1. **matricula** (Columna A): Número de matrícula del vehículo (requerido)
2. **tracker_id** (Columna B): ID del tracker GPS (opcional)

### Notas importantes:
- La primera fila debe contener los encabezados
- El sistema procesa desde la fila 2 en adelante
- Si la matrícula **ya existe**: actualiza el `tracker_id`
- Si la matrícula **no existe**: crea una nueva matrícula

## Ejemplo de Request usando cURL

```bash
curl -X POST http://localhost:8000/api/matriculas/import/ \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "X-App-Key: YOUR_APP_KEY" \
  -F "file=@matriculas.xlsx"
```

## Ejemplo de Request usando JavaScript (fetch)

```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);

const response = await fetch('http://localhost:8000/api/matriculas/import/', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'X-App-Key': appKey
  },
  body: formData
});

const result = await response.json();
console.log(result);
```

## Respuesta Exitosa

```json
{
  "message": "Importación completada",
  "created": 5,
  "updated": 3,
  "total_processed": 8,
  "total_errors": 0,
  "errors": []
}
```

## Respuesta con Errores

```json
{
  "message": "Importación completada",
  "created": 5,
  "updated": 2,
  "total_processed": 7,
  "total_errors": 2,
  "errors": [
    {
      "fila": 3,
      "error": "Número de matrícula vacío"
    },
    {
      "fila": 8,
      "error": "Error específico de validación"
    }
  ]
}
```

## Campos de Respuesta

- **message**: Mensaje general del resultado
- **created**: Cantidad de matrículas nuevas creadas
- **updated**: Cantidad de matrículas existentes actualizadas
- **total_processed**: Total de registros procesados exitosamente
- **total_errors**: Total de errores encontrados
- **errors**: Array con los errores detallados por fila

## Errores Comunes

### 400 - Bad Request
```json
{
  "error": "No se proporcionó ningún archivo"
}
```

```json
{
  "error": "El archivo debe ser un archivo XLSX"
}
```

```json
{
  "error": "El archivo debe tener al menos 2 columnas (matricula, tracker_id)"
}
```

### 401 - Unauthorized
```json
{
  "error": "Token inválido o expirado"
}
```

### 500 - Internal Server Error
```json
{
  "error": "Error al procesar el archivo: [detalle del error]"
}
```

## Validaciones

1. ✅ El archivo debe ser `.xlsx`
2. ✅ Debe tener al menos 2 columnas
3. ✅ El número de matrícula no puede estar vacío
4. ✅ Se salta la primera fila (encabezados)
5. ✅ Los valores vacíos en `tracker_id` son permitidos
6. ✅ Las matrículas duplicadas en el archivo se procesan secuencialmente

## Comportamiento

### Creación de Matrícula
Si la matrícula **no existe** en la base de datos:
- Se crea un nuevo registro
- Se asigna el `nro_matricula` de la columna A
- Se asigna el `tracker_id` de la columna B (puede ser null)
- Se asigna automáticamente el usuario que realiza la importación como `usuario_creacion`
- No se asigna empresa (campo `empresa_id` queda como null)

### Actualización de Matrícula
Si la matrícula **ya existe** en la base de datos:
- Se actualiza solo el campo `tracker_id`
- Los demás campos permanecen sin cambios
- Se actualiza automáticamente el campo `updated_at`
