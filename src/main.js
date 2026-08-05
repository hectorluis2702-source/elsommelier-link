import { HeaderProgress } from './components/HeaderProgress.js';
import { WorldMap } from './components/WorldMap.js';
import { CavaModal } from './components/CavaModal.js';

/**
 * Vinotipos - Fase 1 Core Application
 */
class VinotiposApp {
  constructor() {
    this.headerContainer = document.querySelector('#header-root');
    this.mainContainer = document.querySelector('#main-content');
    this.modalContainer = document.querySelector('#modal-root');

    this.worldMapComp = null;
    this.init();
  }

  init() {
    new HeaderProgress(this.headerContainer, () => this.openCavaModal());
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
    new CavaModal(this.modalContainer, () => {
      this.modalContainer.innerHTML = '';
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
