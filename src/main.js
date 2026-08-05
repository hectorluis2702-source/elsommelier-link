import { HeaderProgress } from './components/HeaderProgress.js';
import { WorldMap } from './components/WorldMap.js';
import { CavaModal } from './components/CavaModal.js';
import { ShopModal } from './components/ShopModal.js';
import { AgeGate } from './components/AgeGate.js';
import { StreakBanner } from './components/StreakBanner.js';
import { audioEngine } from './components/AudioEngine.js';
import { gameState } from './services/GameState.js';

/**
 * Vinotipos - Fase 2 Core Application
 */
class VinotiposApp {
  constructor() {
    this.headerContainer = document.querySelector('#header-root');
    this.mainContainer = document.querySelector('#main-content');
    this.modalContainer = document.querySelector('#modal-root');
    this.footerContainer = document.querySelector('#footer-root');
    this.ageGateContainer = document.querySelector('#age-gate-root');
    this.streakBannerContainer = document.querySelector('#streak-banner-root');

    this.worldMapComp = null;
    this.init();
  }

  init() {
    this.renderFooter();

    // Fase 2 (obligatorio): la app no se renderiza hasta confirmar edad.
    if (gameState.hasConfirmedAge()) {
      this.startApp();
    } else {
      new AgeGate(this.ageGateContainer, () => this.startApp());
    }
  }

  startApp() {
    new HeaderProgress(this.headerContainer, () => this.openCavaModal());
    new StreakBanner(this.streakBannerContainer);
    this.showWorldMap();
  }

  showWorldMap() {
    if (this.worldMapComp) {
      this.worldMapComp.destroy();
      this.worldMapComp = null;
    }
    this.mainContainer.innerHTML = '';
    this.worldMapComp = new WorldMap(this.mainContainer, this.modalContainer);
  }

  openCavaModal() {
    new CavaModal(
      this.modalContainer,
      () => { this.modalContainer.innerHTML = ''; },
      () => this.openShopModal()
    );
  }

  openShopModal() {
    new ShopModal(this.modalContainer, () => {
      this.modalContainer.innerHTML = '';
    });
  }

  renderFooter() {
    if (!this.footerContainer) return;
    const isMuted = audioEngine.muted;
    this.footerContainer.innerHTML = `
      <button id="btn-audio-toggle" class="footer-audio-toggle" aria-pressed="${!isMuted}"
        title="${isMuted ? 'Activar sonido' : 'Silenciar sonido'}">
        ${isMuted ? '🔇' : '🔊'} <span class="footer-audio-toggle-label">${isMuted ? 'Sonido apagado' : 'Sonido activado'}</span>
      </button>
      <p class="footer-disclaimer">
        Este contenido es educativo. Bebe con responsabilidad. Prohibida su venta o
        consumo a menores de edad.
      </p>
    `;

    this.footerContainer.querySelector('#btn-audio-toggle')?.addEventListener('click', () => {
      audioEngine.toggleMuted();
      this.renderFooter();
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new VinotiposApp();
});

// Registro del Service Worker para PWA offline
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(err => {
      console.warn('Service Worker no pudo registrarse:', err);
    });
  });
}
