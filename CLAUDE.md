# Vinotipos - Guía de Desarrollo para Claude Code

## Visión del Proyecto
**Vinotipos** es la plataforma educativa de enología más interactiva y lúdica del mundo. Integrará gamificación profunda, la mascota dinámica 'Corchito', mapas de regiones vitivinícolas del mundo, efectos de sonido diegéticos sintéticos (Web Audio API), una Cava de botellas coleccionables y un minijuego de maridaje en restaurantes.

---

## 🎨 Paleta Oficial de Colores: Dark Elegance

- **Borgoña**: `#800020`
- **Dorado**: `#B8860B`
- **Fondo**: `#121212`
- **Crema**: `#F5EFE0`

```css
:root {
  --color-borgona: #800020;
  --color-dorado: #B8860B;
  --color-fondo: #121212;
  --color-crema: #F5EFE0;
}
```

---

## 📌 Estado de Fases de Desarrollo

### 🟢 FASE 1 (COMPLETADA Y SELLADA)
1. **Código Base & Sistema de Diseño**:
   - Paleta oficial Dark Elegance aplicada a todo el CSS.
   - HTML5 semántico + CSS Glassmorphism.
2. **Mapa Mundial de Regiones Vitivinícolas (`WorldMap.js`)**:
   - Regiones: Champagne 🇫🇷, Toscana 🇮🇹, La Rioja 🇪🇸, Mendoza 🇦🇷, Napa Valley 🇺🇸.
   - Modal de **Paradas Educativas** (Clima, Terroir, Varietales).
3. **Mascota 'Corchito' Base (`Corchito.js`)**:
   - 5 estados de UX (*Idle*, *Acierto*, *Fallo*, *Racha_Fallos*, *Bloqueado*).
4. **Cava Digital Coleccionable - Versión Básica (`CavaModal.js`)**:
   - Galería de botellas reales desbloqueables por XP.

---

### ⏸️ FASE 2 (EN PAUSA - ESPERANDO ORDEN EXPLÍCITA)
- `AudioEngine.js` *(Efectos de sonido Web Audio API)*
- `CourseEngine.js` *(Rueda de Aromas & Restaurante)*
- `ShopModal.js` *(Tienda de Disfraces y Buffs)*

> **Nota para Claude Code**: No importar ni ejecutar ningún archivo de la Fase 2 hasta que el usuario lo ordene explícitamente.
