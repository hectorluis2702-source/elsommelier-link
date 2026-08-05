import { gameState } from '../services/GameState.js';
import { pickPhrase, PHRASES } from '../data/corchitoPhrases.js';

const STREAK_FREEZE_COST = 50;

/**
 * Fase 2 (prompt 2) — Aviso visual cuando la racha real está en riesgo
 * (el jugador tiene racha activa pero todavía no completó ningún reto hoy).
 * Ofrece comprar "Congelar Racha" con Gemas, que gameState consumirá
 * automáticamente la próxima vez que se salte exactamente un día.
 */
export class StreakBanner {
  constructor(containerEl) {
    this.container = containerEl;
    this.unsubscribe = gameState.subscribe(() => this.render());
    this.render();
  }

  render() {
    if (!this.container) return;

    if (!gameState.ready || !gameState.isStreakAtRisk()) {
      this.container.innerHTML = '';
      return;
    }

    const streak = gameState.state.streak;
    const freezes = gameState.state.streakFreezes || 0;
    const canAfford = gameState.state.gems >= STREAK_FREEZE_COST;

    this.container.innerHTML = `
      <div class="streak-banner glass-panel">
        <span class="streak-banner-icon" aria-hidden="true">😟</span>
        <span class="streak-banner-text">
          ${pickPhrase(PHRASES.rachaEnRiesgo, streak)}
          ${freezes > 0 ? `<span class="streak-banner-freezes">(${freezes} 🧊 en reserva)</span>` : ''}
        </span>
        <button id="streak-freeze-btn" class="streak-freeze-btn" ${canAfford ? '' : 'disabled'}
          title="${canAfford ? 'Protege un día sin jugar' : 'Gemas insuficientes'}">
          🧊 Congelar racha (${STREAK_FREEZE_COST} 💎)
        </button>
      </div>
    `;

    this.container.querySelector('#streak-freeze-btn')?.addEventListener('click', () => {
      gameState.buyStreakFreeze(STREAK_FREEZE_COST);
    });
  }

  destroy() {
    if (this.unsubscribe) this.unsubscribe();
  }
}
