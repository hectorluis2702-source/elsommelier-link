import { gameState } from '../services/GameState.js';

export class HeaderProgress {
  constructor(containerEl, onOpenCava) {
    this.container = containerEl;
    this.onOpenCava = onOpenCava;

    this.unsubscribe = gameState.subscribe(() => {
      this.render();
    });
    this.render();
  }

  render() {
    if (!this.container) return;
    const state = gameState.state;

    const html = `
      <div class="header-bar glass-panel">
        <a href="#" class="brand-logo" id="btn-brand">
          🍷 VINOTIPOS <span class="brand-badge">Fase 1</span>
        </a>

        <div class="user-stats">
          <div class="stat-pill">
            <span class="stat-icon">⭐</span>
            <span>${state.xp}</span><span class="stat-label">&nbsp;XP</span>
          </div>

          <div class="stat-pill stat-gold">
            <span class="stat-icon">💎</span>
            <span>${state.gems}</span><span class="stat-label">&nbsp;Gemas</span>
          </div>

          <div class="stat-pill stat-streak">
            <span class="stat-icon">🔥</span>
            <span>${state.streak}</span><span class="stat-label">&nbsp;Días</span>
          </div>

          <button id="btn-cava" class="btn-header">
            <span>🍾</span><span class="btn-header-label">&nbsp;La Cava Digital</span>
          </button>
        </div>
      </div>
    `;

    this.container.innerHTML = html;

    const btnCava = this.container.querySelector('#btn-cava');
    if (btnCava && this.onOpenCava) {
      btnCava.addEventListener('click', () => this.onOpenCava());
    }
  }

  destroy() {
    if (this.unsubscribe) this.unsubscribe();
  }
}
