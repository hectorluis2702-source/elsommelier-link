// Motor de Maridaje - Sistema de compatibilidad entre vinos y comidas

class MaridajeEngine {
  constructor() {
    // Reglas de maridaje basadas en características
    this.reglasMaridaje = {
      // Carnes rojas
      carneRoja: {
        vinosIdeales: ['reds', 'port'],
        caracteristicas: ['taninos altos', 'cuerpo completo', 'robusto'],
        puntuacion: 95
      },
      // Carnes blancas
      carneBlanca: {
        vinosIdeales: ['whites', 'rose'],
        caracteristicas: ['acidez media', 'cuerpo ligero', 'frutal'],
        puntuacion: 90
      },
      // Pescados y mariscos
      pescado: {
        vinosIdeales: ['whites', 'sparkling'],
        caracteristicas: ['acidez alta', 'mineral', 'fresco'],
        puntuacion: 92
      },
      // Platos picantes
      picante: {
        vinosIdeales: ['whites', 'rose', 'sparkling'],
        caracteristicas: ['dulce', 'bajo alcohol', 'refrescante'],
        puntuacion: 85
      },
      // Postres
      postre: {
        vinosIdeales: ['dessert', 'sparkling'],
        caracteristicas: ['dulce', 'aromático', 'elegante'],
        puntuacion: 93
      },
      // Quesos
      queso: {
        vinosIdeales: ['reds', 'whites', 'port'],
        caracteristicas: ['estructurado', 'complejo'],
        puntuacion: 88
      },
      // Frituras
      frito: {
        vinosIdeales: ['sparkling', 'whites'],
        caracteristicas: ['acidez alta', 'burbujas', 'limpio'],
        puntuacion: 87
      },
      // Guisos
      guiso: {
        vinosIdeales: ['reds'],
        caracteristicas: ['cuerpo medio-alto', 'tánico', 'especiado'],
        puntuacion: 91
      }
    };

    // Maridajes específicos para platos dominicanos
    this.platosDominicanos = {
      'mofongo': {
        tipo: 'frito',
        intensidad: 'alta',
        proteina: 'cerdo',
        vinosRecomendados: [
          { tipo: 'whites', variedad: 'Chardonnay', compatibilidad: 88 },
          { tipo: 'sparkling', variedad: 'Prosecco', compatibilidad: 85 },
          { tipo: 'rose', variedad: 'Rosé seco', compatibilidad: 82 }
        ]
      },
      'sancocho': {
        tipo: 'guiso',
        intensidad: 'alta',
        proteina: 'mixta',
        vinosRecomendados: [
          { tipo: 'reds', variedad: 'Malbec', compatibilidad: 92 },
          { tipo: 'reds', variedad: 'Tempranillo', compatibilidad: 90 },
          { tipo: 'reds', variedad: 'Syrah', compatibilidad: 88 }
        ]
      },
      'la bandera': {
        tipo: 'carneRoja',
        intensidad: 'media',
        proteina: 'res',
        vinosRecomendados: [
          { tipo: 'reds', variedad: 'Merlot', compatibilidad: 89 },
          { tipo: 'reds', variedad: 'Pinot Noir', compatibilidad: 85 },
          { tipo: 'rose', variedad: 'Rosé robusto', compatibilidad: 80 }
        ]
      },
      'pastelon': {
        tipo: 'carneRoja',
        intensidad: 'alta',
        proteina: 'res',
        vinosRecomendados: [
          { tipo: 'reds', variedad: 'Cabernet Sauvignon', compatibilidad: 91 },
          { tipo: 'reds', variedad: 'Malbec', compatibilidad: 89 },
          { tipo: 'reds', variedad: 'Zinfandel', compatibilidad: 87 }
        ]
      },
      'chivo guisado': {
        tipo: 'carneRoja',
        intensidad: 'muy alta',
        proteina: 'chivo',
        vinosRecomendados: [
          { tipo: 'reds', variedad: 'Cabernet Sauvignon', compatibilidad: 94 },
          { tipo: 'reds', variedad: 'Syrah', compatibilidad: 92 },
          { tipo: 'port', variedad: 'Oporto Ruby', compatibilidad: 88 }
        ]
      },
      'yaroa': {
        tipo: 'frito',
        intensidad: 'alta',
        proteina: 'mixta',
        vinosRecomendados: [
          { tipo: 'sparkling', variedad: 'Cava', compatibilidad: 86 },
          { tipo: 'rose', variedad: 'Rosé seco', compatibilidad: 84 },
          { tipo: 'whites', variedad: 'Sauvignon Blanc', compatibilidad: 81 }
        ]
      },
      'locrio': {
        tipo: 'carneBlanca',
        intensidad: 'media',
        proteina: 'pollo',
        vinosRecomendados: [
          { tipo: 'whites', variedad: 'Chardonnay', compatibilidad: 90 },
          { tipo: 'whites', variedad: 'Viognier', compatibilidad: 87 },
          { tipo: 'rose', variedad: 'Rosé frutal', compatibilidad: 85 }
        ]
      },
      'habichuelas con dulce': {
        tipo: 'postre',
        intensidad: 'dulce',
        proteina: 'ninguna',
        vinosRecomendados: [
          { tipo: 'dessert', variedad: 'Late Harvest', compatibilidad: 93 },
          { tipo: 'dessert', variedad: 'Moscato', compatibilidad: 91 },
          { tipo: 'sparkling', variedad: 'Moscato Espumoso', compatibilidad: 89 }
        ]
      }
    };
  }

  // Calcular compatibilidad entre un vino y un plato
  calcularCompatibilidad(vino, plato) {
    const platoKey = this.normalizarNombre(plato.nombre);
    const configPlato = this.platosDominicanos[platoKey];

    if (!configPlato) {
      // Si no es un plato dominicano conocido, usar reglas generales
      return this.compatibilidadGenerica(vino, plato);
    }

    // Buscar compatibilidad específica
    const vinoRecomendado = configPlato.vinosRecomendados.find(
      v => v.tipo === vino.tipo
    );

    if (vinoRecomendado) {
      return {
        compatibilidad: vinoRecomendado.compatibilidad,
        explicacion: `${vino.nombre} es un excelente maridaje para ${plato.nombre}. ${this.generarExplicacion(vino, plato, vinoRecomendado.compatibilidad)}`,
        recomendacion: vinoRecomendado.variedad,
        nivel: this.obtenerNivelCompatibilidad(vinoRecomendado.compatibilidad)
      };
    }

    // Si el tipo de vino no está en las recomendaciones específicas
    return {
      compatibilidad: 60,
      explicacion: `${vino.nombre} puede acompañar ${plato.nombre}, pero hay opciones más adecuadas.`,
      recomendacion: configPlato.vinosRecomendados[0].variedad,
      nivel: 'media'
    };
  }

  // Compatibilidad genérica para platos no dominicanos
  compatibilidadGenerica(vino, plato) {
    let puntuacion = 70; // Base

    // Analizar categorías y características del plato
    const categoriaPlato = this.detectarCategoria(plato);
    const regla = this.reglasMaridaje[categoriaPlato];

    if (regla && regla.vinosIdeales.includes(vino.tipo)) {
      puntuacion = regla.puntuacion;
    }

    return {
      compatibilidad: puntuacion,
      explicacion: this.generarExplicacion(vino, plato, puntuacion),
      recomendacion: regla ? regla.vinosIdeales[0] : 'whites',
      nivel: this.obtenerNivelCompatibilidad(puntuacion)
    };
  }

  // Recomendar vinos para un plato específico
  recomendarVinosParaPlato(nombrePlato) {
    const platoKey = this.normalizarNombre(nombrePlato);
    const configPlato = this.platosDominicanos[platoKey];

    if (!configPlato) {
      return {
        plato: nombrePlato,
        recomendaciones: [],
        mensaje: 'Plato no encontrado en la base de maridajes dominicanos'
      };
    }

    return {
      plato: nombrePlato,
      tipo: configPlato.tipo,
      intensidad: configPlato.intensidad,
      recomendaciones: configPlato.vinosRecomendados.map(v => ({
        tipo: v.tipo,
        variedad: v.variedad,
        compatibilidad: v.compatibilidad,
        nivel: this.obtenerNivelCompatibilidad(v.compatibilidad),
        descripcion: this.generarDescripcionVino(v)
      }))
    };
  }

  // Recomendar platos para un vino específico
  recomendarPlatosParaVino(tipoVino) {
    const platosRecomendados = [];

    for (const [nombrePlato, config] of Object.entries(this.platosDominicanos)) {
      const vinoCompatible = config.vinosRecomendados.find(v => v.tipo === tipoVino);
      
      if (vinoCompatible) {
        platosRecomendados.push({
          plato: nombrePlato,
          compatibilidad: vinoCompatible.compatibilidad,
          nivel: this.obtenerNivelCompatibilidad(vinoCompatible.compatibilidad),
          tipo: config.tipo,
          intensidad: config.intensidad
        });
      }
    }

    // Ordenar por compatibilidad
    platosRecomendados.sort((a, b) => b.compatibilidad - a.compatibilidad);

    return platosRecomendados;
  }

  // Normalizar nombre de plato (quitar acentos, minúsculas, espacios)
  normalizarNombre(nombre) {
    return nombre
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .replace('la bandera', 'la bandera')
      .replace('pastelon', 'pastelon')
      .replace('habichuelas con dulce', 'habichuelas con dulce');
  }

  // Detectar categoría de un plato basado en sus características
  detectarCategoria(plato) {
    const nombre = plato.nombre.toLowerCase();
    const categoria = plato.categoria?.toLowerCase() || '';

    if (nombre.includes('carne') || nombre.includes('res') || categoria.includes('beef')) {
      return 'carneRoja';
    }
    if (nombre.includes('pollo') || nombre.includes('chicken')) {
      return 'carneBlanca';
    }
    if (nombre.includes('pescado') || nombre.includes('fish') || nombre.includes('marisco')) {
      return 'pescado';
    }
    if (nombre.includes('postre') || nombre.includes('dessert') || categoria.includes('dessert')) {
      return 'postre';
    }
    if (nombre.includes('frito') || nombre.includes('fried')) {
      return 'frito';
    }
    if (nombre.includes('guiso') || nombre.includes('stew')) {
      return 'guiso';
    }

    return 'carneBlanca'; // Default
  }

  // Generar explicación de maridaje
  generarExplicacion(vino, plato, compatibilidad) {
    if (compatibilidad >= 90) {
      return `Maridaje excepcional. Los sabores se complementan perfectamente.`;
    } else if (compatibilidad >= 80) {
      return `Muy buena combinación. El vino realza los sabores del plato.`;
    } else if (compatibilidad >= 70) {
      return `Buena opción. El vino acompaña bien el plato.`;
    } else {
      return `Maridaje aceptable, aunque hay mejores opciones disponibles.`;
    }
  }

  // Generar descripción de un vino
  generarDescripcionVino(vinoRecomendado) {
    const descripciones = {
      'Chardonnay': 'Vino blanco con cuerpo, notas de frutas tropicales y mantequilla',
      'Sauvignon Blanc': 'Blanco fresco y herbáceo con alta acidez',
      'Malbec': 'Tinto robusto con notas de ciruela y chocolate',
      'Cabernet Sauvignon': 'Tinto estructurado con taninos firmes y notas de cassis',
      'Merlot': 'Tinto suave con notas de cereza y vainilla',
      'Pinot Noir': 'Tinto elegante y ligero con notas de frutos rojos',
      'Syrah': 'Tinto especiado con notas de pimienta negra',
      'Tempranillo': 'Tinto equilibrado con notas de cereza y cuero',
      'Prosecco': 'Espumoso italiano ligero y refrescante',
      'Cava': 'Espumoso español seco y elegante',
      'Late Harvest': 'Vino dulce de cosecha tardía',
      'Moscato': 'Vino aromático y dulce con notas florales'
    };

    return descripciones[vinoRecomendado.variedad] || 'Vino de excelente calidad';
  }

  // Obtener nivel de compatibilidad textual
  obtenerNivelCompatibilidad(puntuacion) {
    if (puntuacion >= 90) return 'excelente';
    if (puntuacion >= 80) return 'muy buena';
    if (puntuacion >= 70) return 'buena';
    if (puntuacion >= 60) return 'aceptable';
    return 'baja';
  }

  // Obtener todos los platos dominicanos disponibles
  obtenerPlatosDominicanos() {
    return Object.keys(this.platosDominicanos).map(key => ({
      id: key,
      nombre: key.charAt(0).toUpperCase() + key.slice(1).replace(/-/g, ' '),
      tipo: this.platosDominicanos[key].tipo,
      intensidad: this.platosDominicanos[key].intensidad
    }));
  }
}

module.exports = new MaridajeEngine();
