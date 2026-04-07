# 📸 Módulo Scanner - El Sommelier RD

Sistema de escaneo de etiquetas de vino usando **GPT-4o Vision** de Azure OpenAI.

---

## 🎯 **Características**

- ✅ Escanea etiquetas de vino con la cámara
- ✅ Extrae automáticamente: nombre, bodega, variedad, año, región
- ✅ Guarda vinos en Supabase (bodega personal)
- ✅ Historial de vinos escaneados
- ✅ Notas de cata personalizadas
- ✅ Búsqueda de vinos similares

---

## 🔌 **Endpoints del Scanner**

### **1. Analizar Etiqueta (sin guardar)**

```http
POST /api/scanner/analizar
Content-Type: application/json

{
  "imagen": "base64_string_aqui",
  "userId": "opcional"
}
```

**Respuesta:**
```json
{
  "success": true,
  "datos": {
    "nombre": "Reserva Cabernet Sauvignon",
    "bodega": "Concha y Toro",
    "variedad": "Cabernet Sauvignon",
    "año": "2019",
    "region": "Valle de Maipo, Chile",
    "denominacion": "D.O. Valle de Maipo",
    "alcohol": "13.5%",
    "tipo": "tinto",
    "confianza": "alta",
    "notas": "Etiqueta clara y legible"
  }
}
```

---

### **2. Escanear y Guardar**

```http
POST /api/scanner/escanear-y-guardar
Content-Type: application/json

{
  "imagen": "base64_string_aqui",
  "userId": "user123"
}
```

**Respuesta:**
```json
{
  "success": true,
  "datos": {
    "nombre": "...",
    "bodega": "...",
    ...
  },
  "vino": {
    "id": 1,
    "user_id": "user123",
    "nombre": "...",
    "fecha_escaneo": "2026-04-07T..."
  },
  "mensaje": "Vino escaneado y guardado en tu bodega"
}
```

---

### **3. Obtener Historial**

```http
GET /api/scanner/historial/:userId?limite=20
```

**Respuesta:**
```json
{
  "success": true,
  "cantidad": 5,
  "vinos": [
    {
      "id": 1,
      "nombre": "Reserva Cabernet",
      "bodega": "Concha y Toro",
      "fecha_escaneo": "2026-04-07",
      ...
    }
  ]
}
```

---

### **4. Actualizar Notas de Cata**

```http
PUT /api/scanner/notas/:vinoId
Content-Type: application/json

{
  "notas": "Taninos firmes, notas de cereza negra y vainilla. Excelente con carnes rojas.",
  "calificacion": 9
}
```

---

### **5. Eliminar Vino**

```http
DELETE /api/scanner/vino/:vinoId
Content-Type: application/json

{
  "userId": "user123"
}
```

---

### **6. Buscar Vinos Similares**

```http
POST /api/scanner/buscar-similar
Content-Type: application/json

{
  "nombre": "Reserva Cabernet",
  "bodega": "Concha y Toro"
}
```

---

## 📱 **Cómo Usar en la App**

### **Paso 1: Capturar Imagen**

```javascript
// En React Native
import { Camera } from 'react-native-camera';

const tomarFoto = async () => {
  const options = { quality: 0.8, base64: true };
  const data = await camera.current.takePictureAsync(options);
  return data.base64;
};
```

### **Paso 2: Enviar al Backend**

```javascript
const escanearVino = async (imagenBase64) => {
  const response = await fetch('https://elsommelier-backend.vercel.app/api/scanner/escanear-y-guardar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      imagen: imagenBase64,
      userId: 'user123'
    })
  });

  const resultado = await response.json();
  
  if (resultado.success) {
    console.log('Vino escaneado:', resultado.datos);
    console.log('ID guardado:', resultado.vino.id);
  }
};
```

### **Paso 3: Mostrar Resultado**

```javascript
// Mostrar datos del vino escaneado
<View>
  <Text>{resultado.datos.nombre}</Text>
  <Text>{resultado.datos.bodega}</Text>
  <Text>{resultado.datos.variedad} - {resultado.datos.año}</Text>
  <Text>{resultado.datos.region}</Text>
</View>
```

---

## 🔧 **Configuración Requerida**

### **Variables de Entorno**

```env
# Azure OpenAI (GPT-4o Vision)
AZURE_OPENAI_ENDPOINT=https://sommelier-de-cabecera.openai.azure.com/
AZURE_OPENAI_KEY=tu_key_aqui
AZURE_OPENAI_DEPLOYMENT=Cerebro-Elsommelier-RD

# Supabase
SUPABASE_URL=https://owitiknzzzzalmyweipl.supabase.co
SUPABASE_SERVICE_KEY=tu_service_key_aqui
```

### **Tabla en Supabase**

La tabla `vinos_escaneados` ya existe con estos campos:
- `id` (primary key)
- `user_id` (texto)
- `nombre` (texto)
- `bodega` (texto)
- `variedad` (texto)
- `año` (texto)
- `region` (texto)
- `denominacion` (texto)
- `alcohol` (texto)
- `tipo` (texto)
- `imagen_url` (texto)
- `metodo_escaneo` (texto)
- `confianza` (texto)
- `notas_escaneo` (texto)
- `fecha_escaneo` (timestamp)
- `calificacion_usuario` (integer)
- `notas_cata` (texto)
- `maridajes_sugeridos` (jsonb)

---

## ⚡ **Limitaciones**

- Máximo **10MB** por imagen
- Formato: **JPEG, PNG** (en base64)
- Requiere **etiqueta legible** (buena iluminación)
- **GPT-4o Vision** tiene límites de rate (depende de tu plan Azure)

---

## 🎨 **Mejores Prácticas**

1. **Buena iluminación** - Foto clara de la etiqueta
2. **Enfoque correcto** - Texto legible
3. **Etiqueta completa** - Capturar toda la etiqueta frontal
4. **Sin reflejos** - Evitar flash directo
5. **Ángulo recto** - Foto perpendicular a la botella

---

## 📊 **Datos Extraídos**

El scanner extrae automáticamente:

| Campo | Descripción | Ejemplo |
|-------|-------------|---------|
| nombre | Nombre del vino | "Reserva Especial" |
| bodega | Productor/bodega | "Viña Concha y Toro" |
| variedad | Tipo de uva | "Cabernet Sauvignon" |
| año | Vintage | "2019" |
| region | Región/país | "Valle de Maipo, Chile" |
| denominacion | D.O. | "D.O. Valle de Maipo" |
| alcohol | Grado alcohólico | "13.5%" |
| tipo | Categoría | "tinto/blanco/rosado/espumoso" |
| confianza | Nivel de certeza | "alta/media/baja" |

---

## 🚀 **Ejemplo Completo**

```javascript
// Flujo completo: Tomar foto → Escanear → Guardar → Ver historial

const flujoCompleto = async () => {
  // 1. Tomar foto
  const foto = await tomarFoto();
  
  // 2. Escanear
  const resultado = await escanearVino(foto);
  
  if (resultado.success) {
    // 3. Mostrar datos
    alert(`Vino: ${resultado.datos.nombre} - ${resultado.datos.bodega}`);
    
    // 4. Ver historial actualizado
    const historial = await obtenerHistorial('user123');
    console.log('Total vinos en bodega:', historial.cantidad);
  }
};
```

---

## 🛡️ **Seguridad**

- Validación de imagen en el backend
- Límite de tamaño (10MB)
- Verificación de formato base64
- User ID requerido para operaciones privadas
- RLS (Row Level Security) en Supabase

---

**¡El scanner está listo para usar!** 📸🍷
