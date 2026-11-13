const fetch = require('node-fetch');

// TheMealDB API - Recetas internacionales GRATIS
const MEAL_API_BASE = 'https://www.themealdb.com/api/json/v1/1';

// Open Food Facts API - Productos alimenticios GRATIS
const FOOD_API_BASE = 'https://world.openfoodfacts.org/api/v2';

class ComidaAPI {
  // Buscar recetas por nombre
  async buscarReceta(nombre) {
    try {
      const response = await fetch(`${MEAL_API_BASE}/search.php?s=${encodeURIComponent(nombre)}`);
      const data = await response.json();
      
      if (!data.meals) return [];

      return data.meals.map(meal => ({
        id: meal.idMeal,
        nombre: meal.strMeal,
        categoria: meal.strCategory,
        origen: meal.strArea,
        imagen: meal.strMealThumb,
        video: meal.strYoutube,
        instrucciones: meal.strInstructions,
        ingredientes: this.extraerIngredientes(meal),
        tags: meal.strTags ? meal.strTags.split(',') : []
      }));
    } catch (error) {
      console.error('Error buscando receta:', error);
      return [];
    }
  }

  // Obtener receta por ID
  async obtenerReceta(id) {
    try {
      const response = await fetch(`${MEAL_API_BASE}/lookup.php?i=${id}`);
      const data = await response.json();
      
      if (!data.meals || data.meals.length === 0) return null;

      const meal = data.meals[0];
      return {
        id: meal.idMeal,
        nombre: meal.strMeal,
        categoria: meal.strCategory,
        origen: meal.strArea,
        imagen: meal.strMealThumb,
        video: meal.strYoutube,
        instrucciones: meal.strInstructions,
        ingredientes: this.extraerIngredientes(meal),
        tags: meal.strTags ? meal.strTags.split(',') : []
      };
    } catch (error) {
      console.error('Error obteniendo receta:', error);
      return null;
    }
  }

  // Buscar recetas por categoría
  async obtenerPorCategoria(categoria) {
    try {
      const response = await fetch(`${MEAL_API_BASE}/filter.php?c=${encodeURIComponent(categoria)}`);
      const data = await response.json();
      
      if (!data.meals) return [];

      return data.meals.map(meal => ({
        id: meal.idMeal,
        nombre: meal.strMeal,
        imagen: meal.strMealThumb
      }));
    } catch (error) {
      console.error('Error obteniendo por categoría:', error);
      return [];
    }
  }

  // Obtener platos dominicanos (simulados con categorías similares)
  async obtenerPlatosDominicanos() {
    const platosDominicanos = [
      {
        id: 'dom001',
        nombre: 'Mofongo',
        categoria: 'Plato Principal',
        origen: 'República Dominicana',
        descripcion: 'Plátanos verdes machacados con chicharrón, ajo y aceite de oliva',
        ingredientes: ['Plátanos verdes', 'Chicharrón', 'Ajo', 'Aceite de oliva'],
        imagen: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=400',
        maridajeRecomendado: ['Vino blanco seco', 'Cerveza clara']
      },
      {
        id: 'dom002',
        nombre: 'Sancocho',
        categoria: 'Sopa',
        origen: 'República Dominicana',
        descripcion: 'Sopa espesa con varios tipos de carnes y tubérculos',
        ingredientes: ['Carne de res', 'Pollo', 'Cerdo', 'Yuca', 'Plátano', 'Maíz'],
        imagen: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400',
        maridajeRecomendado: ['Vino tinto medio cuerpo', 'Cerveza amber']
      },
      {
        id: 'dom003',
        nombre: 'La Bandera',
        categoria: 'Plato Principal',
        origen: 'República Dominicana',
        descripcion: 'Arroz blanco, habichuelas guisadas y carne guisada',
        ingredientes: ['Arroz', 'Habichuelas', 'Carne de res', 'Cilantro', 'Ají'],
        imagen: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400',
        maridajeRecomendado: ['Vino tinto ligero', 'Rosado']
      },
      {
        id: 'dom004',
        nombre: 'Pastelón',
        categoria: 'Plato Principal',
        origen: 'República Dominicana',
        descripcion: 'Lasaña de plátano maduro con carne molida',
        ingredientes: ['Plátanos maduros', 'Carne molida', 'Queso', 'Huevos'],
        imagen: 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=400',
        maridajeRecomendado: ['Vino tinto medio cuerpo', 'Malbec']
      },
      {
        id: 'dom005',
        nombre: 'Chivo Guisado',
        categoria: 'Plato Principal',
        origen: 'República Dominicana',
        descripcion: 'Carne de chivo guisada con especias dominicanas',
        ingredientes: ['Carne de chivo', 'Orégano', 'Ajo', 'Vinagre', 'Cerveza'],
        imagen: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400',
        maridajeRecomendado: ['Vino tinto robusto', 'Cabernet Sauvignon']
      },
      {
        id: 'dom006',
        nombre: 'Yaroa',
        categoria: 'Comida Rápida',
        origen: 'República Dominicana',
        descripcion: 'Plátano maduro frito con carne, queso y salsas',
        ingredientes: ['Plátano maduro', 'Carne', 'Queso', 'Mayonesa', 'Ketchup'],
        imagen: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400',
        maridajeRecomendado: ['Cerveza clara', 'Vino rosado']
      },
      {
        id: 'dom007',
        nombre: 'Locrio de Pollo',
        categoria: 'Arroz',
        origen: 'República Dominicana',
        descripcion: 'Arroz cocinado con pollo y especias al estilo dominicano',
        ingredientes: ['Arroz', 'Pollo', 'Pimientos', 'Aceitunas', 'Cilantro'],
        imagen: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400',
        maridajeRecomendado: ['Vino blanco', 'Sauvignon Blanc']
      },
      {
        id: 'dom008',
        nombre: 'Habichuelas con Dulce',
        categoria: 'Postre',
        origen: 'República Dominicana',
        descripcion: 'Dulce cremoso de habichuelas con leche de coco y especias',
        ingredientes: ['Habichuelas rojas', 'Leche de coco', 'Canela', 'Azúcar', 'Batata'],
        imagen: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400',
        maridajeRecomendado: ['Vino de postre', 'Late Harvest', 'Moscato']
      }
    ];

    return platosDominicanos;
  }

  // Buscar productos alimenticios (Open Food Facts)
  async buscarProducto(nombre) {
    try {
      const response = await fetch(`${FOOD_API_BASE}/search?search_terms=${encodeURIComponent(nombre)}&page_size=10`);
      const data = await response.json();
      
      if (!data.products) return [];

      return data.products.map(product => ({
        id: product.code,
        nombre: product.product_name || 'Sin nombre',
        marca: product.brands || 'Sin marca',
        categorias: product.categories_tags || [],
        imagen: product.image_url || 'https://via.placeholder.com/300',
        nutricion: {
          energia: product.nutriments?.['energy-kcal_100g'],
          proteinas: product.nutriments?.proteins_100g,
          carbohidratos: product.nutriments?.carbohydrates_100g,
          grasas: product.nutriments?.fat_100g
        },
        ingredientes: product.ingredients_text
      }));
    } catch (error) {
      console.error('Error buscando producto:', error);
      return [];
    }
  }

  // Extraer ingredientes de un meal de TheMealDB
  extraerIngredientes(meal) {
    const ingredientes = [];
    for (let i = 1; i <= 20; i++) {
      const ingrediente = meal[`strIngredient${i}`];
      const medida = meal[`strMeasure${i}`];
      if (ingrediente && ingrediente.trim()) {
        ingredientes.push({
          nombre: ingrediente,
          cantidad: medida || ''
        });
      }
    }
    return ingredientes;
  }

  // Obtener categorías disponibles
  async obtenerCategorias() {
    try {
      const response = await fetch(`${MEAL_API_BASE}/categories.php`);
      const data = await response.json();
      
      return data.categories.map(cat => ({
        id: cat.idCategory,
        nombre: cat.strCategory,
        imagen: cat.strCategoryThumb,
        descripcion: cat.strCategoryDescription
      }));
    } catch (error) {
      console.error('Error obteniendo categorías:', error);
      return [];
    }
  }
}

module.exports = new ComidaAPI();
