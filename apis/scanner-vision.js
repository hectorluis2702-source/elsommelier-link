const fetch = require('node-fetch');
const { createClient } = require('@supabase/supabase-js');

class ScannerVision {
  constructor() {
    this.endpoint = (process.env.AZURE_OPENAI_ENDPOINT || '').replace(/\/$/, '');
    this.apiKey = process.env.AZURE_OPENAI_KEY;
    this.deployment = process.env.AZURE_OPENAI_DEPLOYMENT || 'Cerebro-Elsommelier-RD';
    this.apiVersion = process.env.AZURE_OPENAI_API_VERSION || '2024-10-21';
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;
    this.supabase = createClient(process.env.SUPABASE_URL, supabaseKey);
  }

  // Valida y limpia el base64 (acepta data URL o raw base64)
  validarImagenBase64(imagenBase64) {
    if (!imagenBase64 || typeof imagenBase64 !== 'string') {
      return { valido: false, error: 'La imagen es requerida y debe ser texto base64' };
    }
    let imagenLimpia = imagenBase64.trim();
    let mimeType = 'image/jpeg';
    if (imagenLimpia.startsWith('data:')) {
      const match = imagenLimpia.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
      if (!match) return { valido: false, error: 'Formato de data URL invalido' };
      mimeType = match[1];
      imagenLimpia = match[2];
    }
    if (imagenLimpia.length < 1000) {
      return { valido: false, error: 'La imagen parece demasiado pequeña o invalida' };
    }
    return { valido: true, imagenLimpia, mimeType };
  }

  // Analiza una etiqueta de vino con GPT-4o Vision
  async analizarEtiquetaVino(imagenBase64, userId = null) {
    try {
      const prompt = `Eres El Maestro, sommelier experto de El Sommelier RD. Analiza esta etiqueta de vino con precision profesional.

Devuelve SOLO un JSON valido (sin markdown, sin texto extra) con esta estructura exacta:
{
  "nombre": "nombre del vino",
  "bodega": "nombre de la bodega",
  "tipo": "tinto|blanco|rosado|espumoso|fortificado|dulce",
  "pais": "pais de origen",
  "region": "region vinicola",
  "denominacion_origen": "DO o appellation si aplica",
  "uvas": ["uva1", "uva2"],
  "cosecha": 2020,
  "graduacion_alcoholica": "14%",
  "descripcion": "descripcion corta del vino en 2-3 oraciones",
  "nota_cata": "nota de cata profesional con descriptores visuales, aromaticos y gustativos",
  "maridaje": "maridajes recomendados, especialmente con gastronomia dominicana",
  "precio_estimado_usd": "15-25 USD",
  "confianza": 0.95
}

Si no puedes leer un dato con claridad, usa null. La nota de cata debe ser rica en descriptores sensoriales.`;

      const url = `${this.endpoint}/openai/deployments/${this.deployment}/chat/completions?api-version=${this.apiVersion}`;
      console.log('[Scanner] Azure URL:', url);

      const apiResponse = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'api-key': this.apiKey },
        body: JSON.stringify({
          messages: [{
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              {
                type: 'image_url',
                image_url: { url: `data:image/jpeg;base64,${imagenBase64}`, detail: 'high' }
              }
            ]
          }],
          max_tokens: 1200,
          temperature: 0.2
        })
      });

      if (!apiResponse.ok) {
        const errText = await apiResponse.text();
        console.error('[Scanner] Azure error:', apiResponse.status, errText);
        throw new Error(`Azure OpenAI error ${apiResponse.status}: ${errText}`);
      }

      const result = await apiResponse.json();
      if (result.error) throw new Error(result.error.message);

      const rawContent = result.choices[0].message.content
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

      let datosVino;
      try {
        datosVino = JSON.parse(rawContent);
      } catch (e) {
        console.error('[Scanner] JSON parse error:', rawContent);
        throw new Error('La IA no devolvio JSON valido');
      }

      return {
        success: true,
        datos: datosVino,
        tokensUsados: result.usage?.total_tokens || null
      };
    } catch (error) {
      console.error('[Scanner] Error analizarEtiquetaVino:', error.message);
      return { success: false, error: error.message };
    }
  }

  // Guarda un vino escaneado en Supabase
  async guardarVinoEscaneado(datosVino, userId = null) {
    try {
      const registro = {
        Nombre: datosVino.nombre || 'Vino desconocido',
        nota_cata: datosVino.nota_cata || null,
        maridaje: Array.isArray(datosVino.maridajes_recomendados)
          ? datosVino.maridajes_recomendados.join(', ')
          : (datosVino.maridaje || null),
        denominacion_origen: datosVino.denominacion_origen || null,
        cosecha: datosVino.cosecha ? String(datosVino.cosecha) : null,
        user_id: userId || null
      };
      const { data, error } = await this.supabase
        .from('vinos_escaneados')
        .insert([registro])
        .select();
      if (error) throw error;
      return { success: true, vino: data[0] };
    } catch (error) {
      console.error('[Scanner] Error guardarVinoEscaneado:', error.message);
      return { success: false, error: error.message };
    }
  }

  // Historial de vinos escaneados por usuario
  async obtenerHistorialEscaneos(userId, limite = 20) {
    try {
      const { data, error } = await this.supabase
        .from('vinos_escaneados')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limite);
      if (error) throw error;
      return { success: true, total: data.length, historial: data };
    } catch (error) {
      console.error('[Scanner] Error obtenerHistorialEscaneos:', error.message);
      return { success: false, error: error.message, historial: [] };
    }
  }

  // Actualizar notas de cata
  async actualizarNotasCata(vinoId, notas, calificacion = null) {
    try {
      const update = { nota_cata: notas };
      if (calificacion !== null) update.calificacion = calificacion;
      const { data, error } = await this.supabase
        .from('vinos_escaneados')
        .update(update)
        .eq('id', vinoId)
        .select();
      if (error) throw error;
      return { success: true, vino: data[0] };
    } catch (error) {
      console.error('[Scanner] Error actualizarNotasCata:', error.message);
      return { success: false, error: error.message };
    }
  }

  // Eliminar vino escaneado (solo el dueño)
  async eliminarVinoEscaneado(vinoId, userId) {
    try {
      const { error } = await this.supabase
        .from('vinos_escaneados')
        .delete()
        .eq('id', vinoId)
        .eq('user_id', userId);
      if (error) throw error;
      return { success: true, mensaje: 'Vino eliminado correctamente' };
    } catch (error) {
      console.error('[Scanner] Error eliminarVinoEscaneado:', error.message);
      return { success: false, error: error.message };
    }
  }

  // Buscar vinos similares en el catalogo propio
  async buscarVinoSimilar({ nombre, bodega }) {
    try {
      let query = this.supabase
        .from('vinos_catalogo')
        .select('id, nombre, bodega, tipo, pais, region, uvas, puntuacion, precio_rango, imagen_url')
        .limit(5);
      if (nombre) query = query.ilike('nombre', `%${nombre}%`);
      else if (bodega) query = query.ilike('bodega', `%${bodega}%`);
      const { data, error } = await query;
      if (error) throw error;
      return { success: true, total: data.length, vinos: data };
    } catch (error) {
      console.error('[Scanner] Error buscarVinoSimilar:', error.message);
      return { success: false, error: error.message, vinos: [] };
    }
  }
}

module.exports = new ScannerVision();
