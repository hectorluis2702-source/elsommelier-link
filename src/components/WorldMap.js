import { REGIONS_DATA } from '../data/regionsData.js';
import { gameState } from '../services/GameState.js';
import { Corchito } from './Corchito.js';
import { CourseEngine } from './CourseEngine.js';
import { RouteAnimation } from './RouteAnimation.js';
import { pickPhrase, PHRASES } from '../data/corchitoPhrases.js';

export class WorldMap {
  constructor(containerEl, modalContainerEl) {
    this.container = containerEl;
    this.modalContainer = modalContainerEl || document.getElementById('modal-root');
    this.corchitoModalInstance = null;
    this.courseEngineInstance = null;
    this.mapHostEl = null;
    this.pendingRouteAnimation = null;
    this.routeAnimationInstance = null;

    // Estadisticas reales por region (aciertos/total desde region_answer_history),
    // usadas por la fila de cada region en el Atlas ("Dominada"/"En progreso"/
    // badge X/Y). Se cachean en memoria y se refrescan en los puntos donde el
    // usuario vuelve a ver el mapa, no en cada notificacion de gameState (eso
    // dispararia una lectura a Supabase por cada XP/gema ganada durante un reto).
    this.stats = null;

    // Fase 2 (prompt 2): cuando gameState desbloquea una region nueva (gate de
    // 80% real, no decorativo), animamos a Corchito viajando hasta ella.
    this.offRegionUnlocked = gameState.on('region:unlocked', (region) => {
      const from = REGIONS_DATA.find(r => r.id === gameState.state.currentRegionId) || region;
      this.pendingRouteAnimation = { from, to: region };
      this.tryPlayPendingAnimation();
    });

    this.unsubscribe = gameState.subscribe(() => {
      this.render();
    });
    this.refreshStatsAndRender();
  }

  async refreshStatsAndRender() {
    this.stats = await gameState.computeProgressStats();
    // Si la animacion de ruta (GSAP) esta reproduciendose, no pisamos su DOM a
    // mitad de camino: su propio onComplete llama a gameState.setCurrentRegion,
    // que ya dispara un render() (con this.stats ya fresco) al terminar.
    if (!this.routeAnimationInstance) this.render();
  }

  render() {
    if (!this.container) return;
    const state = gameState.state;

    const html = `
      <div class="world-map-container glass-panel atlas-container">
        <div class="map-header">
          <div>
            <h2 class="map-title">Atlas del Vino</h2>
            <p class="map-subtitle">Explora los terroirs mas emblematicos del mundo con Corchito</p>
          </div>
        </div>

        <div class="atlas-panel">
          <div class="atlas-grain"></div>
          ${REGIONS_DATA.map(region => {
            const isUnlocked = state.unlockedRegionIds.includes(region.id);
            return `
              <button type="button" class="atlas-pin ${isUnlocked ? 'active' : 'locked'}"
                style="top:${region.coords.y}%; left:${region.coords.x}%;"
                data-id="${region.id}" title="${region.name}"
                aria-label="${region.name}${isUnlocked ? '' : ' (bloqueada)'}">
                ${region.flag}
              </button>
            `;
          }).join('')}
        </div>

        <p class="atlas-caption">Toca una región para continuar tu ruta con Corchito</p>

        <div class="atlas-list">
          ${REGIONS_DATA.map(region => this.renderRegionRow(region, state)).join('')}
        </div>
      </div>
    `;

    this.container.innerHTML = html;
    this.mapHostEl = this.container.querySelector('.world-map-container');

    this.container.querySelectorAll('.atlas-pin, .atlas-row').forEach(el => {
      el.addEventListener('click', () => this.handleRegionClick(el.getAttribute('data-id')));
    });

    this.tryPlayPendingAnimation();
  }

  handleRegionClick(id) {
    const region = REGIONS_DATA.find(r => r.id === id);
    const isUnlocked = gameState.state.unlockedRegionIds.includes(id);
    if (isUnlocked && region) {
      gameState.setCurrentRegion(id);
      this.openRegionModal(region);
    }
  }

  // Estado real de una region para su fila en el Atlas — nunca datos inventados:
  // "Corchito está aquí" viene de state.currentRegionId, "Dominada"/"En progreso"
  // y el badge X/Y vienen de this.stats (region_answer_history real).
  renderRegionRow(region, state) {
    const isUnlocked = state.unlockedRegionIds.includes(region.id);
    const isCurrent = state.currentRegionId === region.id;
    const stat = this.stats?.byRegion.get(region.id);
    const mastered = isUnlocked && !!this.stats && gameState.isRegionMastered(this.stats, region.id);

    let statusText;
    if (!isUnlocked) {
      statusText = `Requiere ${region.reqXP} XP`;
    } else if (isCurrent) {
      statusText = 'Corchito está aquí';
    } else if (mastered) {
      statusText = 'Dominada';
    } else if (stat && stat.total > 0) {
      statusText = 'En progreso';
    } else {
      statusText = 'Aún sin practicar';
    }

    const badge = !isUnlocked
      ? '🔒'
      : (stat && stat.total > 0 ? `${stat.correct}/${stat.total}` : '—');

    return `
      <div class="atlas-row ${!isUnlocked ? 'locked' : ''} ${isCurrent ? 'current' : ''}" data-id="${region.id}">
        <div class="atlas-row-flag">${region.flag}</div>
        <div class="atlas-row-info">
          <div class="atlas-row-name">${region.name}</div>
          <div class="atlas-row-sub">${statusText}</div>
        </div>
        <div class="atlas-row-badge">${badge}</div>
      </div>
    `;
  }

  // Reproduce la animación de ruta guardada en cuanto el mapa esté visible y
  // sin ningún otro modal (reto, revelación) tapándolo.
  tryPlayPendingAnimation() {
    if (!this.pendingRouteAnimation || !this.mapHostEl) return;
    if (this.modalContainer && this.modalContainer.innerHTML.trim() !== '') return;

    const { from, to } = this.pendingRouteAnimation;
    this.pendingRouteAnimation = null;

    this.routeAnimationInstance = new RouteAnimation(this.mapHostEl, {
      from,
      to,
      onComplete: () => {
        this.routeAnimationInstance = null;
        gameState.setCurrentRegion(to.id);
      }
    });
  }

  openRegionModal(region) {
    if (!this.modalContainer) return;

    this.modalContainer.innerHTML = `
      <div class="modal-overlay" id="region-modal-overlay">
        <div class="modal-content glass-panel">
          <button id="btn-close-region-modal" class="modal-close-btn" aria-label="Cerrar">&#x2715;</button>

          <div class="region-modal-header">
            <div class="region-modal-title-group">
              <span class="region-modal-flag">${region.flag}</span>
              <div>
                <span class="region-country">${region.country}</span>
                <h2 class="region-modal-name">${region.name}</h2>
              </div>
            </div>
            <div id="corchito-modal-slot" class="corchito-modal-slot"></div>
          </div>

          <p class="region-modal-desc">${region.description}</p>

          <div class="terroir-panel">
            <h4 class="terroir-panel-title">Parada Educativa: Terroir &amp; Varietales</h4>
            <ul class="terroir-list">
              <li><strong>Suelo:</strong> ${region.terroirInfo.suelo}</li>
              <li><strong>Clima:</strong> ${region.terroirInfo.clima}</li>
              <li><strong>Varietales Estrella:</strong> ${region.terroirInfo.varietales.join(', ')}</li>
            </ul>
          </div>

          <button id="btn-start-challenge" class="btn-header region-modal-cta">
            \ud83c\udfaf Comenzar Reto
          </button>
        </div>
      </div>
    `;

    const corchitoSlot = this.modalContainer.querySelector('#corchito-modal-slot');
    if (corchitoSlot) {
      this.corchitoModalInstance = new Corchito(corchitoSlot);
      this.corchitoModalInstance.setState('acierto', pickPhrase(PHRASES.bienvenidaRegion, region.name));
    }

    this.modalContainer.querySelector('#btn-close-region-modal')
      .addEventListener('click', () => this.closeRegionModal());

    this.modalContainer.querySelector('#region-modal-overlay')
      .addEventListener('click', (e) => {
        if (e.target.id === 'region-modal-overlay') this.closeRegionModal();
      });

    this.modalContainer.querySelector('#btn-start-challenge')
      .addEventListener('click', () => this.openCourseEngine(region));
  }

  closeRegionModal() {
    if (this.corchitoModalInstance) {
      this.corchitoModalInstance.destroy();
      this.corchitoModalInstance = null;
    }
    if (this.modalContainer) this.modalContainer.innerHTML = '';
  }

  // Fase 2 (prompt 2): abre el motor de preguntas real para la region elegida,
  // reemplazando el modal educativo por el reto (misma ranura de modal-root).
  openCourseEngine(region) {
    if (!this.modalContainer) return;
    this.closeRegionModal();

    this.courseEngineInstance = new CourseEngine(this.modalContainer, region, {
      onClose: () => this.closeCourseEngine()
    });
  }

  closeCourseEngine() {
    if (this.courseEngineInstance) {
      this.courseEngineInstance.destroy();
      this.courseEngineInstance = null;
    }
    if (this.modalContainer) this.modalContainer.innerHTML = '';
    // El reto pudo haber generado respuestas nuevas (region_answer_history) —
    // refrescamos las estadisticas reales antes de volver a mostrar el Atlas.
    this.refreshStatsAndRender();
    this.tryPlayPendingAnimation();
  }

  destroy() {
    this.closeRegionModal();
    this.closeCourseEngine();
    if (this.routeAnimationInstance) this.routeAnimationInstance.destroy();
    if (this.offRegionUnlocked) this.offRegionUnlocked();
    if (this.unsubscribe) this.unsubscribe();
  }
}
