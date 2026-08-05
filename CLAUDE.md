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

### 🟢 FASE 2 (COMPLETADA Y SELLADA — 3/3 prompts)

#### Prompt 1/3 — Base
1. **Persistencia en Supabase (`services/GameState.js`, `services/supabaseClient.js`)**:
   - Progreso del jugador migrado de LocalStorage a Supabase (proyecto dedicado
     `vinotipos`, id `tmkksgahwvirsdubyrcf`, org `rgfkivekbcrqqzgdbhfc`).
   - Tablas: `player_progress`, `player_unlocks`, `region_answer_history` — todas con RLS
     (`auth.uid() = user_id`).
   - Auth anónima por dispositivo (`supabase.auth.signInAnonymously()`).
   - Interfaz pública de `GameState` sin cambios (`state`, `subscribe`, `addXP`, `addGems`,
     `recordError`, `resetErrors`, `setCurrentRegion`, `equipSkin`, `buySkin`,
     `getEquippedSkin`), por lo que `HeaderProgress.js`, `WorldMap.js` y `CavaModal.js`
     no requirieron cambios de lógica (`CavaModal.js` se suscribió a `gameState` para
     refrescar tras la carga asíncrona).
   - **Requiere paso manual**: habilitar "Anonymous Sign-Ins" en el dashboard de Supabase
     (Authentication → Sign In / Providers) — no hay endpoint de management API expuesto
     para activarlo desde aquí.
2. **Sistema de 5 copas de vida (`HeaderProgress.js`)**:
   - Barra `.lives-bar` bajo el header, ligada a `gameState.state.lives` (0–5).
   - `gameState.recordError()` resta una copa; `gameState.restoreLives()` existe para
     restituirlas pero aún no está conectado a ninguna mecánica (prompt 2/3).
3. **Dificultad progresiva (`data/regionsData.js`)**:
   - Cada región tiene `difficultyLevels` con 3 niveles (`reconocimiento` 2 opciones,
     `distractores` 4 opciones, `produccion_libre` sin imagen). Es solo estructura de
     datos — todavía no hay preguntas reales ni motor que las consuma.
4. **Verificación de edad 18+ (`components/AgeGate.js`)**:
   - Gate obligatorio de primer uso, bloqueo respetuoso si responde "No".
   - Confirmación guardada en LocalStorage (`vinotipos_age_verified_v1`, chequeo síncrono
     al arrancar) y espejada en `player_progress.age_verified` en Supabase.
   - Advertencia permanente de consumo responsable en el footer (`#footer-root`).

#### Prompt 2/3 — Mecánica real de juego
1. **`CourseEngine.js` — motor de preguntas real (activado, ya no es un stub)**:
   - Preguntas generadas dinámicamente por `services/questionGenerator.js` a partir de
     `terroirInfo`/`facts` de `regionsData.js` (nunca datos inventados; distractores =
     hechos reales de otras regiones). 3 niveles: reconocimiento (2 opc.), distractores
     (4 opc.), producción libre (texto, sin imagen).
   - Cada respuesta pasa por `gameState.recordAnswer()` → persiste en
     `region_answer_history`, suma XP/Gemas reales o resta una copa de vida.
   - Gate de 80%: `gameState.checkRegionUnlocks()` exige que **todas** las regiones ya
     desbloqueadas tengan ≥5 respuestas y ≥80% de aciertos (no solo XP) antes de abrir la
     siguiente — se recalcula leyendo `region_answer_history` real, no es decorativo.
2. **Repetición espaciada + certificado**:
   - `gameState.getDueReviewRegion()` reinyecta 1 pregunta de una región ya dominada cuyo
     último acierto tiene 7+ días, mezclada dentro de la sesión.
   - `components/Certificate.js`: al dominar las 5 regiones, genera un certificado PNG
     (canvas, sin dependencias nuevas) con la marca "Héctor García — El Sommelier RD" y
     botón de descarga.
3. **GSAP (`npm install gsap`)**:
   - `components/RouteAnimation.js`: Corchito viaja 2.2-2.5s sobre un path SVG (usa
     `region.coords`) al desbloquear una región nueva.
   - `components/BottleReveal.js`: suspenso de ~1.2s (brillo/pulso) antes de revelar la
     botella; 15% de probabilidad de mostrar una botella "sorpresa" ya desbloqueada de
     otra región en vez de la esperada (nunca inventa un desbloqueo nuevo).
   - Las animaciones de expresión de Corchito (idle/acierto/fallo/racha_fallos/bloqueado)
     siguen siendo 100% CSS — GSAP solo se usa para estas dos coreografías nuevas.
4. **Racha real (`GameState.js` + `components/StreakBanner.js`)**:
   - Se pierde de verdad si no se completa un reto en el día (`registerDailyActivity`).
   - "Congelar Racha" (`gameState.buyStreakFreeze()`, 50 💎) cubre un día salteado.
   - `StreakBanner.js` avisa (reutiliza expresión `racha_fallos` de Corchito) cuando hay
     racha activa y todavía no se jugó hoy.
   - Columnas nuevas en `player_progress`: `last_activity_date`, `streak_freezes`,
     `challenges_today`.
5. **Frases contextuales (`data/corchitoPhrases.js`)**: bancos de frases variadas para
   racha de aciertos, fallo (ánimo, nunca regaño), desbloqueo de región, cierre de sesión.
   Cierre tras 3+ retos en el día = invitación a descansar, **sin ningún bono** — es
   intencional, no otorgar XP/Gemas extra por volumen.

> ✅ **"Anonymous Sign-Ins" confirmado activo** en Authentication → Sign In / Providers del
> proyecto Supabase `vinotipos`. `GameState` autentica y persiste normalmente.

#### Prompt 3/3 — Audio, tienda funcional, puente de marca, monetización futura y deploy
1. **`AudioEngine.js` — Web Audio API sintética (activado, ya no es un stub)**:
   - Osciladores generados en código (sin archivos de audio): arpegio corto de
     acierto/fallo y una mini fanfarria distinta para la revelación de botella (el premio).
   - 100% opcional: envuelto en try/catch, se auto-desactiva sin romper nada si el
     navegador bloquea el `AudioContext` o el jugador lo silencia. Toggle 🔊/🔇 persistente
     en el footer (`vinotipos_audio_muted_v1`).
2. **`ShopModal.js` — tienda funcional (activado, ya no es un stub)**:
   - Compra/equipa skins reales contra `gameState.buySkin`/`equipSkin` (persisten en
     Supabase desde el prompt 1). Entry point: banner "🛍️ Ir a la Tienda" dentro de
     `CavaModal` (no se tocó el header para no romper el layout móvil ya afinado).
   - **Los buffs ya no son cosméticos**: `skin_sommelier` (+20% XP) y `skin_magnate` (x2
     Gemas con 100% precisión) se aplican vía `GameState.getXpBonusMultiplier()` /
     `getGemsBonusMultiplier()`, consumidos por `addXP`/`addGems` — verificado en Supabase
     (ver simulación). `skin_enologo` oculta 1 opción incorrecta en preguntas de 4
     opciones; `skin_vendimiador` sube el umbral de `racha_fallos` de 2 a 3 fallos
     seguidos — ambos aplicados en `CourseEngine.js`.
3. **El "Vinotipo" — puente hacia "Dime tu Carácter" (`data/vinotiposData.js`,
   `components/VinotipoReveal.js`)**:
   - Al dominar (80%+) las 5 regiones, `GameState.computeVinotipo()` calcula el arquetipo
     (Guardián / Nómada / Anfitrión / Alquimista) desde el patrón REAL de
     `region_answer_history` (profundidad en nivel 3, amplitud de regiones, precisión
     global, recuperación tras fallos) — no es aleatorio.
   - `revealVinotipoIfNeeded()` se revela **una sola vez** por jugador (columnas
     `vinotipo_type`/`vinotipo_revealed_at` en `player_progress`) con el mismo lenguaje de
     suspenso GSAP que `BottleReveal`, y cierra mencionando el libro **"Dime tu Carácter" —
     Héctor García, El Sommelier RD**.
4. **Arquitectura `isPremium` (solo datos, sin cobros)**:
   - `regionsData.js` (Mendoza/Napa `true`) y `skinsData.js` (`skin_magnate` `true`) —
     comentarios explicando la intención futura. Ningún gate de la app lee este campo
     todavía; nadie queda bloqueado.
5. **Deploy**: proyecto Vercel `vinotipos` (`prj_nXzr7UrVqzuvzLPfGOAWZifdFzbX`).

> **Nota para Claude Code**: Fase 2 quedó sellada con los 3 prompts. Ideas futuras sin
> comprometer todavía: minijuego "El Restaurante de Corchito" (maridaje), refill de vidas
> más allá del reset diario automático (`ensureFreshDay`), y cualquier cobro real sobre
> los flags `isPremium` (hoy son 100% inertes).
