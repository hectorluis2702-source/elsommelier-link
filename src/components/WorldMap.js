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
    this.render();
  }

  render() {
    if (!this.container) return;
    const state = gameState.state;

    const html = `
      <div class="world-map-container glass-panel">
        <div class="map-header">
          <div>
            <h2 class="map-title">Mapa Mundial de Regiones Vitivinicolas</h2>
            <p class="map-subtitle">Explora los terroirs mas emblematicos del mundo con Corchito</p>
          </div>
        </div>

        <div class="regions-grid">
          ${REGIONS_DATA.map(region => {
            const isUnlocked = state.unlockedRegionIds.includes(region.id);
            const isActive = state.currentRegionId === region.id;
            const reqText = !isUnlocked && region.reqXP ? `Requiere ${region.reqXP} XP` : '';

            return `
              <div class="region-card ${isActive ? 'active' : ''} ${!isUnlocked ? 'locked' : ''}" data-id="${region.id}">
                <div class="region-header">
                  <span class="region-country">${region.country}</span>
                  <span class="region-badge">${isUnlocked ? '\u{1F513} Disponible' : '\u{1F512} ' + reqText}</span>
                </div>
                <h3 class="region-name">${region.flag} ${region.name}</h3>
                <p class="region-desc">${region.description}</p>
                ${isActive ? `<div class="region-active-indicator">Corchito esta en esta region</div>` : ''}
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    this.container.innerHTML = html;
    this.mapHostEl = this.container.querySelector('.world-map-container');

    this.container.querySelectorAll('.region-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.getAttribute('data-id');
        const region = REGIONS_DATA.find(r => r.id === id);
        const isUnlocked = gameState.state.unlockedRegionIds.includes(id);
        if (isUnlocked && region) {
          gameState.setCurrentRegion(id);
          this.openRegionModal(region);
        }
      });
    });

    this.tryPlayPendingAnimation();
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
