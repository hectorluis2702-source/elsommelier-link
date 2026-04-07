const fetch = require('node-fetch');

// API gratuita de vinos: Sampleapis.com Wine API
const WINE_API_BASE = 'https://api.sampleapis.com/wines';

class VinosAPI {
  // Obtener vinos por tipo (reds, whites, sparkling, rose, dessert, port)
  async obtenerVinosPorTipo(tipo = 'reds') {
    try {
      const response = await fetch(`${WINE_API_BASE}/${tipo}`);
      const vinos = await response.json();
      
      return vinos.map(vino => ({
        id: vino.id,
        nombre: vino.wine,
        bodega: vino.winery,
        region: vino.location,
        tipo: tipo,
        rating: vino.rating ? {
          promedio: vino.rating.average,
          votos: vino.rating.reviews
        } : null,
        imagen: vino.image || 'https://via.placeholder.com/300x400?text=Vino'
      }));
    } catch (error) {
      console.error('Error obteniendo vinos:', error);
      return [];
    }
  }

  // Buscar vinos por nombre
  async buscarVino(nombre) {
    try {
      // Buscar en todos los tipos
      const tipos = ['reds', 'whites', 'sparkling', 'rose', 'dessert', 'port'];
      const resultados = [];

      for (const tipo of tipos) {
        const vinos = await this.obtenerVinosPorTipo(tipo);
        const coincidencias = vinos.filter(v => 
          v.nombre.toLowerCase().includes(nombre.toLowerCase()) ||
          v.bodega.toLowerCase().includes(nombre.toLowerCase())
        );
        resultados.push(...coincidencias);
      }

      return resultados;
    } catch (error) {
      console.error('Error buscando vino:', error);
      return [];
    }
  }

  // Obtener vinos recomendados (aleatorios de calidad alta)
  async obtenerRecomendados(limite = 10) {
    try {
      const tipos = ['reds', 'whites', 'sparkling'];
      const todosVinos = [];

      for (const tipo of tipos) {
        const vinos = await this.obtenerVinosPorTipo(tipo);
        todosVinos.push(...vinos);
      }

      // Filtrar por rating alto y mezclar aleatoriamente
      const vinosCalidad = todosVinos.filter(v => 
        v.rating && v.rating.promedio >= 4.0
      );

      // Mezclar y tomar los primeros N
      const mezclados = vinosCalidad.sort(() => Math.random() - 0.5);
      return mezclados.slice(0, limite);
    } catch (error) {
      console.error('Error obteniendo recomendados:', error);
      return [];
    }
  }

  // Obtener todos los tipos disponibles
  obtenerTiposDisponibles() {
    return [
      { id: 'reds', nombre: 'Tintos', descripcion: 'Vinos tintos' },
      { id: 'whites', nombre: 'Blancos', descripcion: 'Vinos blancos' },
      { id: 'sparkling', nombre: 'Espumosos', descripcion: 'Champagne y espumosos' },
      { id: 'rose', nombre: 'Rosados', descripcion: 'Vinos rosados' },
      { id: 'dessert', nombre: 'Postres', descripcion: 'Vinos de postre' },
      { id: 'port', nombre: 'Oporto', descripcion: 'Vinos de Oporto' }
    ];
  }
}

module.exports = new VinosAPI();
