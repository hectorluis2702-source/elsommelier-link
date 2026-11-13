const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
require('dotenv').config();

const vinosAPI = require('./apis/vinos-api');
const comidaAPI = require('./apis/comida-api');
const maridajeEngine = require('./apis/maridaje-engine');
const scannerVision = require('./apis/scanner-vision');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// ======================
// HEALTH CHECK
// ======================
app.get('/api/health', (req, res) => {
  res.json({
    status: 'El Maestro esta en linea',
    timestamp: new Date().toISOString(),
    version: '3.0.0',
    features: {
      scanner: 'GPT-4o Vision — etiquetas de vino con IA',
      vinos: 'Catalogo propio en Supabase',
      comida: 'TheMealDB + platos dominicanos',
      maridaje: 'Motor de maridaje dominicano',
      sommelier: 'Azure OpenAI GPT-4o — El Maestro',
      academia: 'Lecciones desde Supabase con progreso real'
    }
  });
});

// ======================
// VINOS (Supabase)
// ======================

app.get('/api/vinos/tipos', (req, res) => {
  res.json({ success: true, tipos: vinosAPI.obtenerTiposDisponibles() });
});

app.get('/api/vinos/recomendados', async (req, res) => {
  try {
    const limite = parseInt(req.query.limite) || 20;
    const vinos = await vinosAPI.obtenerRecomendados(limite);
    res.json({ success: true, cantidad: vinos.length, vinos });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error obteniendo vinos recomendados', message: error.message });
  }
});

app.get('/api/vinos/catalogo', async (req, res) => {
  try {
    const limite = parseInt(req.query.limite) || 100;
    const vinos = await vinosAPI.obtenerTodos(limite);
    res.json({ success: true, cantidad: vinos.length, vinos });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error obteniendo catalogo', message: error.message });
  }
});

app.get('/api/vinos/buscar/:nombre', async (req, res) => {
  try {
    const vinos = await vinosAPI.buscarVino(req.params.nombre);
    res.json({ success: true, query: req.params.nombre, cantidad: vinos.length, vinos });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error buscando vino', message: error.message });
  }
});

app.get('/api/vinos/tipo/:tipo', async (req, res) => {
  try {
    const vinos = await vinosAPI.obtenerVinosPorTipo(req.params.tipo);
    res.json({ success: true, tipo: req.params.tipo, cantidad: vinos.length, vinos });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error obteniendo vinos por tipo', message: error.message });
  }
});

app.get('/api/vinos/:id', async (req, res) => {
  try {
    const vino = await vinosAPI.obtenerPorId(req.params.id);
    if (!vino) return res.status(404).json({ success: false, error: 'Vino no encontrado' });
    res.json({ success: true, vino });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error obteniendo vino', message: error.message });
  }
});

// ======================
// COMIDA
// ======================

app.get('/api/comida/recetas/buscar/:nombre', async (req, res) => {
  try {
    const recetas = await comidaAPI.buscarReceta(req.params.nombre);
    res.json({ success: true, query: req.params.nombre, cantidad: recetas.length, recetas });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error buscando recetas', message: error.message });
  }
});

app.get('/api/comida/recetas/:id', async (req, res) => {
  try {
    const receta = await comidaAPI.obtenerReceta(req.params.id);
    if (!receta) return res.status(404).json({ success: false, error: 'Receta no encontrada' });
    res.json({ success: true, receta });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error obteniendo receta', message: error.message });
  }
});

app.get('/api/comida/dominicanos', async (req, res) => {
  try {
    const platos = await comidaAPI.obtenerPlatosDominicanos();
    res.json({ success: true, cantidad: platos.length, platos });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error obteniendo platos dominicanos', message: error.message });
  }
});

app.get('/api/comida/categoria/:categoria', async (req, res) => {
  try {
    const recetas = await comidaAPI.obtenerPorCategoria(req.params.categoria);
    res.json({ success: true, categoria: req.params.categoria, cantidad: recetas.length, recetas });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error obteniendo recetas por categoria', message: error.message });
  }
});

app.get('/api/comida/productos/buscar/:nombre', async (req, res) => {
  try {
    const productos = await comidaAPI.buscarProducto(req.params.nombre);
    res.json({ success: true, query: req.params.nombre, cantidad: productos.length, productos });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error buscando productos', message: error.message });
  }
});

app.get('/api/comida/categorias', async (req, res) => {
  try {
    const categorias = await comidaAPI.obtenerCategorias();
    res.json({ success: true, cantidad: categorias.length, categorias });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error obteniendo categorias', message: error.message });
  }
});

// ======================
// MARIDAJE
// ======================

app.get('/api/maridaje/vinos-para/:plato', (req, res) => {
  try {
    const resultado = maridajeEngine.recomendarVinosParaPlato(req.params.plato);
    const recomendaciones = resultado.recomendaciones || [];
    res.json({
      success: true,
      plato: resultado.plato || req.params.plato,
      recomendaciones,
      maridajes: recomendaciones,   // alias para el PWA
      vinos: recomendaciones,       // alias para el PWA
      consejo: resultado.consejo || null,
      total: recomendaciones.length
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error generando recomendaciones', message: error.message });
  }
});

app.get('/api/maridaje/platos-para/:tipoVino', (req, res) => {
  try {
    const recomendaciones = maridajeEngine.recomendarPlatosParaVino(req.params.tipoVino);
    res.json({ success: true, tipoVino: req.params.tipoVino, cantidad: recomendaciones.length, recomendaciones });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error generando recomendaciones de platos', message: error.message });
  }
});

app.post('/api/maridaje/compatibilidad', (req, res) => {
  try {
    const { vino, plato } = req.body;
    if (!vino || !plato) return res.status(400).json({ success: false, error: 'Se requieren datos de vino y plato' });
    const resultado = maridajeEngine.calcularCompatibilidad(vino, plato);
    res.json({ success: true, vino: vino.nombre, plato: plato.nombre, ...resultado });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error calculando compatibilidad', message: error.message });
  }
});

app.get('/api/maridaje/platos-dominicanos', (req, res) => {
  try {
    const platos = maridajeEngine.obtenerPlatosDominicanos();
    res.json({ success: true, cantidad: platos.length, platos });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error obteniendo platos dominicanos', message: error.message });
  }
});

// ======================
// SCANNER (GPT-4o Vision)
// ======================

app.post('/api/scanner/analizar', async (req, res) => {
  try {
    const { imagen, userId } = req.body;
    if (!imagen) return res.status(400).json({ success: false, error: 'Se requiere una imagen en base64' });
    const validacion = scannerVision.validarImagenBase64(imagen);
    if (!validacion.valido) return res.status(400).json({ success: false, error: validacion.error });
    const resultado = await scannerVision.analizarEtiquetaVino(validacion.imagenLimpia, userId);
    res.json(resultado);
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error analizando imagen', message: error.message });
  }
});

app.post('/api/scanner/escanear-y-guardar', async (req, res) => {
  try {
    const { imagen, userId } = req.body;
    if (!imagen) return res.status(400).json({ success: false, error: 'Se requiere una imagen en base64' });
    const validacion = scannerVision.validarImagenBase64(imagen);
    if (!validacion.valido) return res.status(400).json({ success: false, error: validacion.error });
    const analisis = await scannerVision.analizarEtiquetaVino(validacion.imagenLimpia, userId);
    if (!analisis.success) return res.json(analisis);
    const guardado = await scannerVision.guardarVinoEscaneado(analisis.datos, userId || null);
    res.json({
      success: true,
      datos: analisis.datos,
      vino: guardado.vino || null,
      guardado: guardado.success,
      mensaje: guardado.success ? 'Vino escaneado y guardado en tu bodega' : 'Vino analizado (no se pudo guardar)'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error procesando escaneo', message: error.message });
  }
});

app.get('/api/scanner/historial/:userId', async (req, res) => {
  try {
    const limite = parseInt(req.query.limite) || 20;
    const resultado = await scannerVision.obtenerHistorialEscaneos(req.params.userId, limite);
    res.json(resultado);
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error obteniendo historial', message: error.message });
  }
});

app.put('/api/scanner/notas/:vinoId', async (req, res) => {
  try {
    const { notas, calificacion } = req.body;
    if (!notas) return res.status(400).json({ success: false, error: 'Se requieren notas de cata' });
    const resultado = await scannerVision.actualizarNotasCata(req.params.vinoId, notas, calificacion);
    res.json(resultado);
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error actualizando notas', message: error.message });
  }
});

app.delete('/api/scanner/vino/:vinoId', async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ success: false, error: 'Se requiere userId para eliminar' });
    const resultado = await scannerVision.eliminarVinoEscaneado(req.params.vinoId, userId);
    res.json(resultado);
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error eliminando vino', message: error.message });
  }
});

app.post('/api/scanner/buscar-similar', async (req, res) => {
  try {
    const { nombre, bodega } = req.body;
    if (!nombre && !bodega) return res.status(400).json({ success: false, error: 'Se requiere nombre o bodega' });
    const resultado = await scannerVision.buscarVinoSimilar({ nombre, bodega });
    res.json(resultado);
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error buscando vinos similares', message: error.message });
  }
});

// ======================
// SOMMELIER AI — El Maestro (Azure OpenAI GPT-4o)
// ======================

const SYSTEM_PROMPT_MAESTRO = `Eres El Sommelier de Cabecera — el alter ego digital de Héctor García, el Sommelier #1 de la República Dominicana y fundador de El Sommelier RD Academy, la plataforma líder de cultura vinícola dominicana.

IDENTIDAD:
Eres el reflejo digital de Héctor: un profesional de élite con alma caribeña. Combinas el rigor de un Master Sommelier con la calidez de un amigo que te quiere enseñar a vivir mejor a través del vino. No eres un asistente genérico — eres la voz, el criterio y la pasión de Héctor García en formato digital.

TONO Y PERSONALIDAD:
- Directo, brillante, con ingenio natural — nunca frío ni corporativo
- Cálido y lúdico, como una buena conversación entre amigos sobre una copa de Rioja
- Usas metáforas del vino con naturalidad: "eso marida perfecto", "un Gran Reserva de idea", "tiene buen tanino ese argumento"
- Ocasionalmente usas expresiones dominicanas auténticas: "¡Eso sí es lo que es!", "ta bueno eso", "vacano", "qué nivel"
- Educas sin condescender — siempre elevas, nunca bajas

CONOCIMIENTO VINÍCOLA:
- Experto en vinos españoles (Rioja, Ribera del Duero, Priorat), argentinos (Malbec de Mendoza), chilenos, franceses y del mundo
- Dominas el mercado dominicano: precios reales en USD (8-15 USD económico, 16-35 USD medio, 36-80 USD premium, 80+ USD colección)
- Conoces los puntos de venta en RD: La Vinoteca, Vinissimo, Supermercados La Cadena, La Sirena, Jumbo, Plaza Lama
- SIEMPRE conectas el vino con la gastronomía dominicana: mofongo, sancocho, chivo guisado, La Bandera, pastélon, yaroa, locrio, mangú, habichuelas con dulce, chicharrón, asopao

MISIÓN PEDAGÓGICA:
- Haces lo complejo, simple — como debe ser
- Cada respuesta debe servir a la elegancia pedagógica: que el usuario aprenda algo sin darse cuenta
- Cuando recomiendes un vino siempre incluye: nombre, bodega, tipo, precio aproximado en RD, y por qué marida con lo que pregunta el usuario
- Si el usuario es principiante, adaptas el lenguaje. Si es avanzado, elevas el nivel técnico

REGLAS DE ORO:
- Responde SIEMPRE en español
- Sé conciso pero rico en descriptores sensoriales
- Si no sabes algo con certeza, lo dices con honestidad y elegancia — un buen sommelier nunca improvisa donde no domina
- Nunca des precios inventados — usa rangos reales del mercado dominicano
- Recuerda: estás educando a la próxima generación de amantes del vino en RD. Cada respuesta cuenta.`;

app.post('/api/sommelier', async (req, res) => {
  try {
    const { mensaje, historial = [], contexto, userId } = req.body;
    if (!mensaje) return res.status(400).json({ success: false, error: 'El mensaje es requerido' });

    const endpoint = (process.env.AZURE_OPENAI_ENDPOINT || '').replace(/\/$/, '');
    const apiKey = process.env.AZURE_OPENAI_KEY;
    const deployment = process.env.AZURE_OPENAI_DEPLOYMENT || 'Cerebro-Elsommelier-RD';
    const apiVersion = process.env.AZURE_OPENAI_API_VERSION || '2024-10-21';

    if (!endpoint || !apiKey) {
      return res.status(500).json({ success: false, error: 'Configuracion de Azure OpenAI incompleta' });
    }

    const messages = [{ role: 'system', content: SYSTEM_PROMPT_MAESTRO }];

    if (Array.isArray(historial) && historial.length > 0) {
      historial.slice(-10).forEach(h => {
        if (h.role && h.content) messages.push({ role: h.role, content: h.content });
      });
    }

    let mensajeFinal = mensaje;
    if (contexto) mensajeFinal = `[Contexto: ${contexto}]\n\n${mensaje}`;
    messages.push({ role: 'user', content: mensajeFinal });

    const url = `${endpoint}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`;
    console.log('[Sommelier] Llamando Azure OpenAI:', url);

    const apiResponse = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'api-key': apiKey },
      body: JSON.stringify({
        messages,
        max_tokens: 800,
        temperature: 0.7,
        presence_penalty: 0.3,
        frequency_penalty: 0.3
      })
    });

    if (!apiResponse.ok) {
      const errText = await apiResponse.text();
      console.error('[Sommelier] Azure error:', apiResponse.status, errText);
      throw new Error(`Azure OpenAI error ${apiResponse.status}`);
    }

    const result = await apiResponse.json();
    if (result.error) throw new Error(result.error.message);

    const respuesta = result.choices[0].message.content;
    const tokensUsados = result.usage?.total_tokens || null;

    // Guardar conversacion en Supabase si hay userId
    if (userId) {
      const supaKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;
      const supaUrl = process.env.SUPABASE_URL;
      if (supaUrl && supaKey) {
        fetch(`${supaUrl}/rest/v1/ai_conversations`, {
          method: 'POST',
          headers: {
            'apikey': supaKey,
            'Authorization': `Bearer ${supaKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ user_id: userId, user_message: mensaje, ai_response: respuesta, tokens_used: tokensUsados })
        }).catch(e => console.error('[Sommelier] Error guardando conversacion:', e.message));
      }
    }

    res.json({ success: true, respuesta, tokensUsados, modelo: deployment });
  } catch (error) {
    console.error('[Sommelier] Error:', error.message);
    res.status(500).json({ success: false, error: 'Error en El Maestro', message: error.message });
  }
});

// ======================
// ACADEMIA (Supabase)
// ======================

const supaUrl = () => process.env.SUPABASE_URL;
const supaKey = () => process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;
const supaHeaders = () => ({
  'apikey': supaKey(),
  'Authorization': `Bearer ${supaKey()}`,
  'Content-Type': 'application/json'
});

app.get('/api/academia/lecciones', async (req, res) => {
  try {
    const nivel = req.query.nivel;
    let url = `${supaUrl()}/rest/v1/lecciones_academy?publicado=eq.true&order=nivel.asc,orden.asc`;
    if (nivel) url += `&nivel=eq.${encodeURIComponent(nivel)}`;
    const r = await fetch(url, { headers: supaHeaders() });
    if (!r.ok) throw new Error(`Supabase error ${r.status}`);
    const lecciones = await r.json();
    res.json({ success: true, total: lecciones.length, lecciones });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error obteniendo lecciones', message: error.message });
  }
});

app.get('/api/academia/lecciones/:slug', async (req, res) => {
  try {
    const url = `${supaUrl()}/rest/v1/lecciones_academy?slug=eq.${encodeURIComponent(req.params.slug)}&limit=1`;
    const r = await fetch(url, { headers: supaHeaders() });
    if (!r.ok) throw new Error(`Supabase error ${r.status}`);
    const data = await r.json();
    if (!data.length) return res.status(404).json({ success: false, error: 'Leccion no encontrada' });
    res.json({ success: true, leccion: data[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error obteniendo leccion', message: error.message });
  }
});

app.get('/api/academia/progreso/:userId', async (req, res) => {
  try {
    const url = `${supaUrl()}/rest/v1/progreso_usuario_academy?user_id=eq.${req.params.userId}`;
    const r = await fetch(url, { headers: supaHeaders() });
    if (!r.ok) throw new Error(`Supabase error ${r.status}`);
    const progreso = await r.json();
    const completadas = progreso.filter(p => p.completada).length;
    res.json({ success: true, total: progreso.length, completadas, progreso });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error obteniendo progreso', message: error.message });
  }
});

app.post('/api/academia/progreso', async (req, res) => {
  try {
    const { userId, leccionId, completada, progreso_porcentaje, tiempo_dedicado, quiz_aprobado } = req.body;
    if (!userId || !leccionId) return res.status(400).json({ success: false, error: 'Se requiere userId y leccionId' });

    const body = {
      user_id: userId,
      leccion_id: leccionId,
      completada: completada || false,
      progreso_porcentaje: progreso_porcentaje || 0,
      tiempo_dedicado: tiempo_dedicado || 0,
      quiz_aprobado: quiz_aprobado || false,
      ultima_vista: new Date().toISOString()
    };

    const r = await fetch(`${supaUrl()}/rest/v1/progreso_usuario_academy`, {
      method: 'POST',
      headers: { ...supaHeaders(), 'Prefer': 'resolution=merge-duplicates,return=representation' },
      body: JSON.stringify(body)
    });
    if (!r.ok) throw new Error(`Supabase error ${r.status}`);
    const data = await r.json();
    res.json({ success: true, progreso: data[0] || body });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error guardando progreso', message: error.message });
  }
});

// ======================
// RUTA RAIZ
// ======================
app.get('/', (req, res) => {
  res.json({
    app: 'El Sommelier RD API',
    version: '3.0.0',
    descripcion: 'El primer sommelier digital dominicano — Backend con IA, Supabase y gastronomia RD',
    autor: 'Master Sommelier Hector Garcia',
    endpoints: {
      health: 'GET /api/health',
      vinos: ['GET /api/vinos/tipo/:tipo', 'GET /api/vinos/buscar/:nombre', 'GET /api/vinos/recomendados', 'GET /api/vinos/catalogo', 'GET /api/vinos/tipos', 'GET /api/vinos/:id'],
      scanner: ['POST /api/scanner/analizar', 'POST /api/scanner/escanear-y-guardar', 'GET /api/scanner/historial/:userId', 'PUT /api/scanner/notas/:vinoId', 'DELETE /api/scanner/vino/:vinoId', 'POST /api/scanner/buscar-similar'],
      sommelier: 'POST /api/sommelier',
      maridaje: ['GET /api/maridaje/vinos-para/:plato', 'GET /api/maridaje/platos-para/:tipoVino', 'POST /api/maridaje/compatibilidad', 'GET /api/maridaje/platos-dominicanos'],
      comida: ['GET /api/comida/recetas/buscar/:nombre', 'GET /api/comida/dominicanos', 'GET /api/comida/categorias'],
      academia: ['GET /api/academia/lecciones', 'GET /api/academia/lecciones/:slug', 'GET /api/academia/progreso/:userId', 'POST /api/academia/progreso']
    }
  });
});

app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Endpoint no encontrado', path: req.path });
});

app.listen(PORT, () => {
  console.log(`\n🍷 El Sommelier RD API v3.0 — puerto ${PORT}`);
  console.log(`   ✅ Vinos: Catalogo propio en Supabase`);
  console.log(`   ✅ Scanner: GPT-4o Vision completo`);
  console.log(`   ✅ Sommelier: El Maestro con Azure OpenAI`);
  console.log(`   ✅ Maridaje: Motor dominicano\n`);
});

module.exports = app;
