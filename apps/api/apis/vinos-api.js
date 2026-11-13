const fetch = require('node-fetch');

// Catalogo propio en Supabase — datos ricos, controlados, dominicanos
class VinosAPI {
  constructor() {
    this.supabaseUrl = process.env.SUPABASE_URL;
    this.supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;
  }

  get headers() {
    return {
      'apikey': this.supabaseKey,
      'Authorization': `Bearer ${this.supabaseKey}`,
      'Content-Type': 'application/json'
    };
  }

  // Mapea cualquier variante de tipo al valor en la tabla
  normalizarTipo(tipo) {
    const mapa = {
      'tintos': 'tinto', 'tinto': 'tinto', 'reds': 'tinto',
      'blancos': 'blanco', 'blanco': 'blanco', 'whites': 'blanco',
      'rosados': 'rosado', 'rosado': 'rosado', 'rose': 'rosado',
      'espumoso': 'espumoso', 'espumosos': 'espumoso', 'sparkling': 'espumoso', 'champagne': 'espumoso',
      'fortificado': 'fortificado', 'oporto': 'fortificado', 'port': 'fortificado',
      'dulce': 'dulce', 'dessert': 'dulce', 'postre': 'dulce',
      'naranja': 'naranja'
    };
    return mapa[tipo?.toLowerCase()] || tipo;
  }

  // Formato estandar de vino para la API
  formatearVino(v) {
    return {
      id: v.id,
      nombre: v.nombre,
      bodega: v.bodega,
      tipo: v.tipo,
      pais: v.pais,
      region: v.region || null,
      denominacion_origen: v.denominacion_origen || null,
      uvas: v.uvas || [],
      varietal: v.uvas ? v.uvas.join(', ') : null,
      descripcion: v.descripcion || null,
      notas_cata: v.notas_cata || null,
      maridajes: v.maridajes || [],
      precio_rango: v.precio_rango || null,
      precio_usd_min: v.precio_usd_min || null,
      precio_usd_max: v.precio_usd_max || null,
      rating: {
        promedio: v.puntuacion || null,
        fuente: v.fuente_puntuacion || null,
        votos: null
      },
      puntuacion_rd: v.puntuacion_rd || null,
      imagen: v.imagen_url || 'https://images.vivino.com/thumbs/ApnIiXjcJFnV1lDXnFo6iQ_pb_x600.png',
      destacado: v.destacado || false,
      disponible_rd: v.disponible_rd !== false
    };
  }

  async obtenerVinosPorTipo(tipo) {
    try {
      const tipoNorm = this.normalizarTipo(tipo);
      const url = `${this.supabaseUrl}/rest/v1/vinos_catalogo?tipo=eq.${encodeURIComponent(tipoNorm)}&order=puntuacion.desc&limit=50`;
      const res = await fetch(url, { headers: this.headers });
      if (!res.ok) throw new Error(`Supabase error ${res.status}`);
      const vinos = await res.json();
      return vinos.map(v => this.formatearVino(v));
    } catch (error) {
      console.error('[VinosAPI] Error obtenerVinosPorTipo:', error.message);
      return [];
    }
  }

  async buscarVino(termino) {
    try {
      const q = encodeURIComponent(termino);
      const url = `${this.supabaseUrl}/rest/v1/vinos_catalogo?or=(nombre.ilike.*${q}*,bodega.ilike.*${q}*)&order=puntuacion.desc&limit=30`;
      const res = await fetch(url, { headers: this.headers });
      if (!res.ok) throw new Error(`Supabase error ${res.status}`);
      const vinos = await res.json();
      return vinos.map(v => this.formatearVino(v));
    } catch (error) {
      console.error('[VinosAPI] Error buscarVino:', error.message);
      return [];
    }
  }

  async obtenerRecomendados(limite = 20) {
    try {
      const url = `${this.supabaseUrl}/rest/v1/vinos_catalogo?destacado=eq.true&order=puntuacion.desc&limit=${limite}`;
      const res = await fetch(url, { headers: this.headers });
      if (!res.ok) throw new Error(`Supabase error ${res.status}`);
      const vinos = await res.json();
      return vinos.map(v => this.formatearVino(v));
    } catch (error) {
      console.error('[VinosAPI] Error obtenerRecomendados:', error.message);
      return [];
    }
  }

  async obtenerTodos(limite = 100) {
    try {
      const url = `${this.supabaseUrl}/rest/v1/vinos_catalogo?order=puntuacion.desc&limit=${limite}`;
      const res = await fetch(url, { headers: this.headers });
      if (!res.ok) throw new Error(`Supabase error ${res.status}`);
      const vinos = await res.json();
      return vinos.map(v => this.formatearVino(v));
    } catch (error) {
      console.error('[VinosAPI] Error obtenerTodos:', error.message);
      return [];
    }
  }

  async obtenerPorId(id) {
    try {
      const url = `${this.supabaseUrl}/rest/v1/vinos_catalogo?id=eq.${id}&limit=1`;
      const res = await fetch(url, { headers: this.headers });
      if (!res.ok) throw new Error(`Supabase error ${res.status}`);
      const vinos = await res.json();
      if (!vinos.length) return null;
      return this.formatearVino(vinos[0]);
    } catch (error) {
      console.error('[VinosAPI] Error obtenerPorId:', error.message);
      return null;
    }
  }

  obtenerTiposDisponibles() {
    return [
      { id: 'tinto',       nombre: 'Tintos',      descripcion: 'Rioja, Malbec, Bordeaux y mas' },
      { id: 'blanco',      nombre: 'Blancos',     descripcion: 'Albarino, Sauvignon Blanc, Chardonnay' },
      { id: 'rosado',      nombre: 'Rosados',     descripcion: 'Provence, rosados espanoles' },
      { id: 'espumoso',    nombre: 'Espumosos',   descripcion: 'Champagne, Cava, espumosos' },
      { id: 'fortificado', nombre: 'Fortificados',descripcion: 'Oporto, Jerez y vinos generosos' },
      { id: 'dulce',       nombre: 'Dulces',      descripcion: 'Vinos de postre y dulces naturales' }
    ];
  }
}

module.exports = new VinosAPI();
