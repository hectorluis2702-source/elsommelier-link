import { REGIONS_DATA } from '../data/regionsData.js';
import { gameState } from '../services/GameState.js';
import { Corchito } from './Corchito.js';

export class WorldMap {
  constructor(containerEl, modalContainerEl) {
    this.container = containerEl;
    this.modalContainer = modalContainerEl || document.getElementById('modal-root');
    this.corchitoModalInstance = null;

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
        </div>
      </div>
    `;

    const corchitoSlot = this.modalContainer.querySelector('#corchito-modal-slot');
    if (corchitoSlot) {
      this.corchitoModalInstance = new Corchito(corchitoSlot);
      this.corchitoModalInstance.setState('acierto', `\u00a1Bienvenido a ${region.name}!`);
    }

    this.modalContainer.querySelector('#btn-close-region-modal')
      .addEventListener('click', () => this.closeRegionModal());

    this.modalContainer.querySelector('#region-modal-overlay')
      .addEventListener('click', (e) => {
        if (e.target.id === 'region-modal-overlay') this.closeRegionModal();
      });
  }

  closeRegionModal() {
    if (this.corchitoModalInstance) {
      this.corchitoModalInstance.destroy();
      this.corchitoModalInstance = null;
    }
    if (this.modalContainer) this.modalContainer.innerHTML = '';
  }

  destroy() {
    this.closeRegionModal();
    if (this.unsubscribe) this.unsubscribe();
  }
}
