const fetch = require('node-fetch');
const { createClient } = require('@supabase/supabase-js');

class ScannerVision {
  constructor() {
    // Azure OpenAI config (REST API directo)
    this.endpoint = process.env.AZURE_OPENAI_ENDPOINT;
    this.apiKey = process.env.AZURE_OPENAI_KEY;
    this.deployment = process.env.AZURE_OPENAI_DEPLOYMENT || 'Cerebro-Elsommelier-RD';
    this.apiVersion = process.env.AZURE_OPENAI_API_VERSION || '2024-02-01';

    // Supabase Client
    this.supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );
  }

  // Analizar imagen de etiqueta de vino con GPT-4o Vision
  async analizarEtiquetaVino(imagenBase64, userId = null) {
    try {
      const prompt = `Eres un experto sommelier analizando una etiqueta de vino.

ANALIZA esta imagen y extrae la siguiente información:

1. Nombre del vino
2. Bodega/Productor
3. Variedad/Tipo de uva (Cabernet, Merlot, Chardonnay, etc.)
4. Año de cosecha (vintage)
5. Región/País de origen
6. Denominación de origen (si está visible)
7. Grado alcohólico (%)
8. Tipo de vino (tinto, blanco, rosado, espumoso)

IMPORTANTE:
- Si algún dato NO es visible, responde "No visible"
- Sé preciso con los nombres
- Identifica correctamente la variedad de uva

Responde SOLO en formato JSON así:
{
  "nombre": "nombre del vino",
  "bodega": "nombre de la bodega",
  "variedad": "tipo de uva",
  "año": "año o No visible",
  "region": "región y país",
  "denominacion": "DO o No visible",
  "alcohol": "% o No visible",
  "tipo": "tinto/blanco/rosado/espumoso",
  "confianza": "alta/media/baja",
  "notas": "observaciones adicionales"
}`;

      // Llamada directa a Azure OpenAI REST API
      console.log('Azure URL:', url);
      console.log('API Key exists:', !!this.apiKey, 'length:', this.apiKey ? this.apiKey.length : 0);
      const url = `${this.endpoint}openai/deployments/${this.deployment}/chat/completions?api-version=${this.apiVersion}`;

      const apiResponse = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': this.apiKey
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: prompt },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:image/jpeg;base64,${imagenBase64}`
                  }
                }
              ]
            }
          ],
          max_tokens: 800,
          temperature: 0.3
     })
      });

    const response = await apiResponse.json();
    console.log('Azure response:', JSON.stringify(response));

    if (!response.choices || !response.choices[0]) {
    throw new Error('No se recibio respuesta de Azure OpenAI');
    }

     const resultado = response.choices[0].message.content;

      // Parsear JSON de la respuesta
      let datosVino;
      try {
        // Limpiar posibles markdown code blocks
        const jsonLimpio = resultado
          .replace(/```json\n?/g, '')
          .replace(/```\n?/g, '')
          .trim();
        
        datosVino = JSON.parse(jsonLimpio);
      } catch (parseError) {
        console.error('Error parseando JSON:', parseError);
        return {
          success: false,
          error: 'No se pudo extraer información estructurada de la imagen',
          respuestaRaw: resultado
        };
      }

      // Enriquecer datos con timestamp
      datosVino.timestamp = new Date().toISOString();
      datosVino.metodo = 'GPT-4o Vision';
      datosVino.userId = userId;

      return {
        success: true,
        datos: datosVino,
        mensaje: 'Etiqueta analizada exitosamente'
      };

    } catch (error) {
      console.error('Error analizando etiqueta:', error);
      return {
        success: false,
        error: 'Error procesando la imagen',
        detalles: error.message
      };
    }
  }

  // Guardar vino escaneado en Supabase
  async guardarVinoEscaneado(datosVino, userId = 'anonimo', imagenUrl = null) {
    try {
      const vinoParaGuardar = {
        user_id: userId,
        nombre: datosVino.nombre,
        bodega: datosVino.bodega,
        variedad: datosVino.variedad,
        año: datosVino.año !== 'No visible' ? datosVino.año : null,
        region: datosVino.region,
        denominacion: datosVino.denominacion !== 'No visible' ? datosVino.denominacion : null,
        alcohol: datosVino.alcohol !== 'No visible' ? datosVino.alcohol : null,
        tipo: datosVino.tipo,
        imagen_url: imagenUrl,
        metodo_escaneo: 'GPT-4o Vision',
        confianza: datosVino.confianza,
        notas_escaneo: datosVino.notas,
        fecha_escaneo: new Date().toISOString(),
        maridajes_sugeridos: [], // Se puede llenar después
        calificacion_usuario: null,
        notas_cata: null
      };

      const { data, error } = await this.supabase
        .from('vinos_escaneados')
        .insert([vinoParaGuardar])
        .select();

      if (error) {
        console.error('Error guardando en Supabase:', error);
        return {
          success: false,
          error: 'Error guardando vino en base de datos',
          detalles: error.message
        };
      }

      return {
        success: true,
        vino: data[0],
        mensaje: 'Vino guardado exitosamente en tu bodega'
      };

    } catch (error) {
      console.error('Error en guardarVinoEscaneado:', error);
      return {
        success: false,
        error: 'Error procesando guardado',
        detalles: error.message
      };
    }
  }

  // Buscar vino en base de datos por características
  async buscarVinoSimilar(datosVino) {
    try {
      const { data, error } = await this.supabase
        .from('vinos_escaneados')
        .select('*')
        .or(`nombre.ilike.%${datosVino.nombre}%,bodega.ilike.%${datosVino.bodega}%`)
        .limit(5);

      if (error) {
        console.error('Error buscando vinos similares:', error);
        return { success: false, vinos: [] };
      }

      return {
        success: true,
        vinos: data || [],
        cantidad: data ? data.length : 0
      };

    } catch (error) {
      console.error('Error en buscarVinoSimilar:', error);
      return { success: false, vinos: [] };
    }
  }

  // Obtener historial de escaneos de un usuario
  async obtenerHistorialEscaneos(userId, limite = 20) {
    try {
      const { data, error } = await this.supabase
        .from('vinos_escaneados')
        .select('*')
        .eq('user_id', userId)
        .order('fecha_escaneo', { ascending: false })
        .limit(limite);

      if (error) {
        console.error('Error obteniendo historial:', error);
        return {
          success: false,
          error: 'Error obteniendo historial',
          vinos: []
        };
      }

      return {
        success: true,
        cantidad: data.length,
        vinos: data
      };

    } catch (error) {
      console.error('Error en obtenerHistorialEscaneos:', error);
      return {
        success: false,
        error: 'Error procesando historial',
        vinos: []
      };
    }
  }

  // Actualizar notas de cata de un vino escaneado
  async actualizarNotasCata(vinoId, notas, calificacion = null) {
    try {
      const actualizacion = {
        notas_cata: notas,
        updated_at: new Date().toISOString()
      };

      if (calificacion !== null) {
        actualizacion.calificacion_usuario = calificacion;
      }

      const { data, error } = await this.supabase
        .from('vinos_escaneados')
        .update(actualizacion)
        .eq('id', vinoId)
        .select();

      if (error) {
        console.error('Error actualizando notas:', error);
        return {
          success: false,
          error: 'Error actualizando notas de cata'
        };
      }

      return {
        success: true,
        vino: data[0],
        mensaje: 'Notas de cata actualizadas'
      };

    } catch (error) {
      console.error('Error en actualizarNotasCata:', error);
      return {
        success: false,
        error: 'Error procesando actualización'
      };
    }
  }

  // Eliminar vino escaneado
  async eliminarVinoEscaneado(vinoId, userId) {
    try {
      const { data, error } = await this.supabase
        .from('vinos_escaneados')
        .delete()
        .eq('id', vinoId)
        .eq('user_id', userId);

      if (error) {
        console.error('Error eliminando vino:', error);
        return {
          success: false,
          error: 'Error eliminando vino'
        };
      }

      return {
        success: true,
        mensaje: 'Vino eliminado de tu bodega'
      };

    } catch (error) {
      console.error('Error en eliminarVinoEscaneado:', error);
      return {
        success: false,
        error: 'Error procesando eliminación'
      };
    }
  }

  // Validar formato de imagen base64
  validarImagenBase64(imagenBase64) {
    if (!imagenBase64 || typeof imagenBase64 !== 'string') {
      return { valido: false, error: 'Imagen no proporcionada' };
    }

    // Verificar que sea base64 válido
    const base64Regex = /^[A-Za-z0-9+/=]+$/;
    const imagenLimpia = imagenBase64.replace(/^data:image\/\w+;base64,/, '');

    if (!base64Regex.test(imagenLimpia)) {
      return { valido: false, error: 'Formato de imagen inválido' };
    }

    // Verificar tamaño (max 10MB en base64)
    const tamaño = (imagenLimpia.length * 3) / 4 / 1024 / 1024; // MB
    if (tamaño > 10) {
      return { valido: false, error: 'Imagen demasiado grande (máx 10MB)' };
    }

    return { valido: true, imagenLimpia };
  }
}

module.exports = new ScannerVision();
