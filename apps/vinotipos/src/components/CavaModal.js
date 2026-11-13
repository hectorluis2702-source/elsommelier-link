import { BOTTLES_CATALOG } from '../data/cavaData.js';
import { gameState } from '../services/GameState.js';
import { VINOTIPOS_CATALOG } from '../data/vinotiposData.js';

export class CavaModal {
  constructor(containerEl, onClose, onOpenShop) {
    this.container = containerEl;
    this.onClose = onClose;
    this.onOpenShop = onOpenShop;
    // La carga de progreso contra Supabase es asincronica: nos suscribimos para
    // refrescar la grilla de botellas si el estado llega despues de abrir el modal.
    this.unsubscribe = gameState.subscribe(() => this.render());
    this.render();
  }

  render() {
    if (!this.container) return;
    const state = gameState.state;
    const vinotipo = state.vinotipoType ? VINOTIPOS_CATALOG[state.vinotipoType] : null;

    const html = `
      <div class="modal-overlay" id="cava-modal-overlay">
        <div class="modal-content glass-panel">
          <button id="btn-close-cava" class="modal-close-btn" aria-label="Cerrar Cava">&#x2715;</button>

          <div class="cava-header">
            <div>
              <h2 class="cava-title">La Cava Digital Coleccionable</h2>
              <p class="cava-subtitle">Coleccion de botellas de vinos reales del mundo desbloqueables por XP.</p>
              ${vinotipo ? `<p class="cava-vinotipo-tag">${vinotipo.emoji} Tu Vinotipo: <strong>${vinotipo.name}</strong></p>` : ''}
            </div>
          </div>

          ${this.onOpenShop ? `
            <button id="btn-go-shop" class="shop-cta-banner glass-panel">
              <span>🛍️</span>
              <span class="shop-cta-text">Visita la Tienda de Corchito — disfraces con poderes reales</span>
            </button>
          ` : ''}

          <div class="cava-grid">
            ${BOTTLES_CATALOG.map(bottle => {
              const isUnlocked = state.unlockedBottleIds.includes(bottle.id);
              const reqText = !isUnlocked && bottle.reqXP ? `Alcanza ${bottle.reqXP} XP` : '';

              return `
                <div class="glass-panel bottle-card ${isUnlocked ? 'unlocked' : 'locked'}">
                  <div class="bottle-card-top">
                    <span class="bottle-icon">${bottle.imageIcon}</span>
                    ${isUnlocked
                      ? `<span class="brand-badge" style="background:${this.getRarityColor(bottle.rarity)};color:#FFF;">${bottle.rarity}</span>`
                      : `<span class="bottle-lock-badge" aria-label="Bloqueada">&#x1F512;</span>`
                    }
                  </div>
                  <h3 class="bottle-name">${bottle.name}</h3>
                  <div class="bottle-region">${bottle.region} &bull; ${bottle.type}</div>
                  ${isUnlocked
                    ? `<p class="bottle-notes"><strong>Notas Sommelier:</strong> ${bottle.notes}</p>`
                    : `<p class="bottle-req-hint">${reqText}</p>`
                  }
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    `;

    this.container.innerHTML = html;

    this.container.querySelector('#btn-close-cava')
      .addEventListener('click', () => this.close());

    this.container.querySelector('#cava-modal-overlay')
      .addEventListener('click', (e) => {
        if (e.target.id === 'cava-modal-overlay') this.close();
      });

    this.container.querySelector('#btn-go-shop')?.addEventListener('click', () => {
      if (this.unsubscribe) this.unsubscribe();
      this.container.innerHTML = '';
      if (this.onOpenShop) this.onOpenShop();
    });
  }

  close() {
    if (this.unsubscribe) this.unsubscribe();
    this.container.innerHTML = '';
    if (this.onClose) this.onClose();
  }

  getRarityColor(rarity) {
    switch (rarity) {
      case 'Legendaria': return 'linear-gradient(135deg, #FFD700, #B8860B)';
      case 'Mitica':
      case 'M\u00edtica': return 'linear-gradient(135deg, #9370DB, #4B0082)';
      case 'Epica':
      case '\u00c9pica': return 'linear-gradient(135deg, #32CD32, #228B22)';
      default: return 'linear-gradient(135deg, #4682B4, #1E90FF)';
    }
  }
}
