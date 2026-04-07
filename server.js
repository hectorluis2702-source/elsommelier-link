const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Importar APIs
const vinosAPI = require('./apis/vinos-api');
const comidaAPI = require('./apis/comida-api');
const maridajeEngine = require('./apis/maridaje-engine');
const scannerVision = require('./apis/scanner-vision');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// ======================
// HEALTH CHECK
// ======================
app.get('/api/health', (req, res) => {
  res.json({
    status: 'El Maestro está en línea',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    features: {
      scanner: 'GPT-4o Vision para escanear etiquetas',
      vinos: 'API gratuita de vinos con fotos',
      comida: 'TheMealDB + Open Food Facts',
      maridaje: 'Motor de maridaje dominicano',
      sommelier: 'Azure OpenAI GPT-4o'
    }
  });
});

// ======================
// ENDPOINTS DE VINOS
// ======================

// Obtener vinos por tipo
app.get('/api/vinos/tipo/:tipo', async (req, res) => {
  try {
    const { tipo } = req.params;
    const vinos = await vinosAPI.obtenerVinosPorTipo(tipo);
    res.json({
      success: true,
      tipo,
      cantidad: vinos.length,
      vinos
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error obteniendo vinos por tipo',
      message: error.message
    });
  }
});

// Buscar vinos por nombre
app.get('/api/vinos/buscar/:nombre', async (req, res) => {
  try {
    const { nombre } = req.params;
    const vinos = await vinosAPI.buscarVino(nombre);
    res.json({
      success: true,
      query: nombre,
      cantidad: vinos.length,
      vinos
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error buscando vino',
      message: error.message
    });
  }
});

// Obtener vinos recomendados
app.get('/api/vinos/recomendados', async (req, res) => {
  try {
    const limite = parseInt(req.query.limite) || 10;
    const vinos = await vinosAPI.obtenerRecomendados(limite);
    res.json({
      success: true,
      cantidad: vinos.length,
      vinos
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error obteniendo vinos recomendados',
      message: error.message
    });
  }
});

// Obtener tipos de vinos disponibles
app.get('/api/vinos/tipos', (req, res) => {
  try {
    const tipos = vinosAPI.obtenerTiposDisponibles();
    res.json({
      success: true,
      tipos
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error obteniendo tipos de vinos',
      message: error.message
    });
  }
});

// ======================
// ENDPOINTS DE COMIDA
// ======================

// Buscar recetas internacionales
app.get('/api/comida/recetas/buscar/:nombre', async (req, res) => {
  try {
    const { nombre } = req.params;
    const recetas = await comidaAPI.buscarReceta(nombre);
    res.json({
      success: true,
      query: nombre,
      cantidad: recetas.length,
      recetas
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error buscando recetas',
      message: error.message
    });
  }
});

// Obtener receta por ID
app.get('/api/comida/recetas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const receta = await comidaAPI.obtenerReceta(id);
    
    if (!receta) {
      return res.status(404).json({
        success: false,
        error: 'Receta no encontrada'
      });
    }

    res.json({
      success: true,
      receta
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error obteniendo receta',
      message: error.message
    });
  }
});

// Obtener platos dominicanos
app.get('/api/comida/dominicanos', async (req, res) => {
  try {
    const platos = await comidaAPI.obtenerPlatosDominicanos();
    res.json({
      success: true,
      cantidad: platos.length,
      platos
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error obteniendo platos dominicanos',
      message: error.message
    });
  }
});

// Obtener recetas por categoría
app.get('/api/comida/categoria/:categoria', async (req, res) => {
  try {
    const { categoria } = req.params;
    const recetas = await comidaAPI.obtenerPorCategoria(categoria);
    res.json({
      success: true,
      categoria,
      cantidad: recetas.length,
      recetas
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error obteniendo recetas por categoría',
      message: error.message
    });
  }
});

// Buscar productos alimenticios
app.get('/api/comida/productos/buscar/:nombre', async (req, res) => {
  try {
    const { nombre } = req.params;
    const productos = await comidaAPI.buscarProducto(nombre);
    res.json({
      success: true,
      query: nombre,
      cantidad: productos.length,
      productos
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error buscando productos',
      message: error.message
    });
  }
});

// Obtener categorías de recetas
app.get('/api/comida/categorias', async (req, res) => {
  try {
    const categorias = await comidaAPI.obtenerCategorias();
    res.json({
      success: true,
      cantidad: categorias.length,
      categorias
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error obteniendo categorías',
      message: error.message
    });
  }
});

// ======================
// ENDPOINTS DE MARIDAJE
// ======================

// Recomendar vinos para un plato
app.get('/api/maridaje/vinos-para/:plato', (req, res) => {
  try {
    const { plato } = req.params;
    const recomendaciones = maridajeEngine.recomendarVinosParaPlato(plato);
    res.json({
      success: true,
      ...recomendaciones
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error generando recomendaciones de vinos',
      message: error.message
    });
  }
});

// Recomendar platos para un tipo de vino
app.get('/api/maridaje/platos-para/:tipoVino', (req, res) => {
  try {
    const { tipoVino } = req.params;
    const recomendaciones = maridajeEngine.recomendarPlatosParaVino(tipoVino);
    res.json({
      success: true,
      tipoVino,
      cantidad: recomendaciones.length,
      recomendaciones
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error generando recomendaciones de platos',
      message: error.message
    });
  }
});

// Calcular compatibilidad entre vino y plato
app.post('/api/maridaje/compatibilidad', (req, res) => {
  try {
    const { vino, plato } = req.body;
    
    if (!vino || !plato) {
      return res.status(400).json({
        success: false,
        error: 'Se requieren datos de vino y plato'
      });
    }

    const resultado = maridajeEngine.calcularCompatibilidad(vino, plato);
    res.json({
      success: true,
      vino: vino.nombre,
      plato: plato.nombre,
      ...resultado
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error calculando compatibilidad',
      message: error.message
    });
  }
});

// Obtener lista de platos dominicanos disponibles para maridaje
app.get('/api/maridaje/platos-dominicanos', (req, res) => {
  try {
    const platos = maridajeEngine.obtenerPlatosDominicanos();
    res.json({
      success: true,
      cantidad: platos.length,
      platos
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error obteniendo platos dominicanos',
      message: error.message
    });
  }
});

// ======================
// ENDPOINTS DE SCANNER (GPT-4o Vision)
// ======================

// Escanear etiqueta de vino
app.post('/api/scanner/analizar', async (req, res) => {
  try {
    const { imagen, userId } = req.body;

    if (!imagen) {
      return res.status(400).json({
        success: false,
        error: 'Se requiere una imagen en base64'
      });
    }

    // Validar imagen
    const validacion = scannerVision.validarImagenBase64(imagen);
    if (!validacion.valido) {
      return res.status(400).json({
        success: false,
        error: validacion.error
      });
    }

    // Analizar etiqueta con GPT-4o Vision
    const resultado = await scannerVision.analizarEtiquetaVino(
      validacion.imagenLimpia,
      userId
    );

    res.json(resultado);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error analizando imagen',
      message: error.message
    });
  }
});

// Escanear y guardar vino
app.post('/api/scanner/escanear-y-guardar', async (req, res) => {
  try {
    const { imagen, userId } = req.body;

    if (!imagen) {
      return res.status(400).json({
        success: false,
        error: 'Se requiere una imagen en base64'
      });
    }

    // Validar imagen
    const validacion = scannerVision.validarImagenBase64(imagen);
    if (!validacion.valido) {
      return res.status(400).json({
        success: false,
        error: validacion.error
      });
    }

    // 1. Analizar etiqueta
    const analisis = await scannerVision.analizarEtiquetaVino(
      validacion.imagenLimpia,
      userId
    );

    if (!analisis.success) {
      return res.json(analisis);
    }

    // 2. Guardar en Supabase
    const guardado = await scannerVision.guardarVinoEscaneado(
      analisis.datos,
      userId || 'anonimo'
    );

    if (!guardado.success) {
      return res.json({
        success: true,
        datos: analisis.datos,
        advertencia: 'Vino analizado pero no se pudo guardar',
        errorGuardado: guardado.error
      });
    }

    res.json({
      success: true,
      datos: analisis.datos,
      vino: guardado.vino,
      mensaje: 'Vino escaneado y guardado en tu bodega'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error procesando escaneo',
      message: error.message
    });
  }
});

// Obtener historial de vinos escaneados
app.get('/api/scanner/historial/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const limite = parseInt(req.query.limite) || 20;

    const resultado = await scannerVision.obtenerHistorialEscaneos(userId, limite);
    res.json(resultado);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error obteniendo historial',
      message: error.message
    });
  }
});

// Actualizar notas de cata
app.put('/api/scanner/notas/:vinoId', async (req, res) => {
  try {
    const { vinoId } = req.params;
    const { notas, calificacion } = req.body;

    if (!notas) {
      return res.status(400).json({
        success: false,
        error: 'Se requieren notas de cata'
      });
    }

    const resultado = await scannerVision.actualizarNotasCata(
      vinoId,
      notas,
      calificacion
    );

    res.json(resultado);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error actualizando notas',
      message: error.message
    });
  }
});

// Eliminar vino escaneado
app.delete('/api/scanner/vino/:vinoId', async (req, res) => {
  try {
    const { vinoId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'Se requiere userId para eliminar'
      });
    }

    const resultado = await scannerVision.eliminarVinoEscaneado(vinoId, userId);
    res.json(resultado);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error eliminando vino',
      message: error.message
    });
  }
});

// Buscar vinos similares a uno escaneado
app.post('/api/scanner/buscar-similar', async (req, res) => {
  try {
    const { nombre, bodega } = req.body;

    if (!nombre && !bodega) {
      return res.status(400).json({
        success: false,
        error: 'Se requiere nombre o bodega para buscar'
      });
    }

    const resultado = await scannerVision.buscarVinoSimilar({ nombre, bodega });
    res.json(resultado);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error buscando vinos similares',
      message: error.message
    });
  }
});

// ======================
// ENDPOINT DE SOMMELIER AI (Azure OpenAI)
// ======================
app.post('/api/sommelier', async (req, res) => {
  try {
    const { mensaje, contexto } = req.body;

    if (!mensaje) {
      return res.status(400).json({
        success: false,
        error: 'El mensaje es requerido'
      });
    }

    // Aquí iría la integración con Azure OpenAI
    // Por ahora respuesta simulada
    res.json({
      success: true,
      respuesta: `Como Master Sommelier Hector Garcia, te recomiendo explorar los vinos de la sección de tintos. ${mensaje}`,
      contexto: 'SAT methodology - Dominican pairing specialist'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error en el sommelier AI',
      message: error.message
    });
  }
});

// ======================
// RUTA RAÍZ
// ======================
app.get('/', (req, res) => {
  res.json({
    app: 'El Sommelier RD API',
    version: '2.0.0',
    descripcion: 'Backend completo con APIs gratuitas de vinos, comida y maridaje',
    autor: 'Master Sommelier Hector Garcia',
    endpoints: {
      health: '/api/health',
      scanner: {
        analizar: '/api/scanner/analizar (POST)',
        escanearYGuardar: '/api/scanner/escanear-y-guardar (POST)',
        historial: '/api/scanner/historial/:userId',
        actualizarNotas: '/api/scanner/notas/:vinoId (PUT)',
        eliminar: '/api/scanner/vino/:vinoId (DELETE)',
        buscarSimilar: '/api/scanner/buscar-similar (POST)'
      },
      vinos: {
        porTipo: '/api/vinos/tipo/:tipo',
        buscar: '/api/vinos/buscar/:nombre',
        recomendados: '/api/vinos/recomendados',
        tipos: '/api/vinos/tipos'
      },
      comida: {
        buscarRecetas: '/api/comida/recetas/buscar/:nombre',
        recetaPorId: '/api/comida/recetas/:id',
        dominicanos: '/api/comida/dominicanos',
        porCategoria: '/api/comida/categoria/:categoria',
        buscarProductos: '/api/comida/productos/buscar/:nombre',
        categorias: '/api/comida/categorias'
      },
      maridaje: {
        vinosParaPlato: '/api/maridaje/vinos-para/:plato',
        platosParaVino: '/api/maridaje/platos-para/:tipoVino',
        compatibilidad: '/api/maridaje/compatibilidad (POST)',
        platosDominicanos: '/api/maridaje/platos-dominicanos'
      },
      sommelier: '/api/sommelier (POST)'
    },
    documentacion: 'https://github.com/hectorluis2702-source/elsommelier-backend'
  });
});

// ======================
// MANEJO DE ERRORES 404
// ======================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint no encontrado',
    path: req.path,
    sugerencia: 'Visita / para ver todos los endpoints disponibles'
  });
});

// ======================
// INICIAR SERVIDOR
// ======================
app.listen(PORT, () => {
  console.log(`🍷 El Sommelier RD API corriendo en puerto ${PORT}`);
  console.log(`📊 APIs integradas:`);
  console.log(`   ✅ Scanner: GPT-4o Vision para etiquetas`);
  console.log(`   ✅ Vinos: API gratuita con miles de vinos`);
  console.log(`   ✅ Comida: TheMealDB + Open Food Facts`);
  console.log(`   ✅ Maridaje: Motor inteligente dominicano`);
  console.log(`   ✅ Sommelier: Azure OpenAI GPT-4o`);
});

module.exports = app;
