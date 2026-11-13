import { SKINS_CATALOG } from '../data/skinsData.js';
import { gameState } from '../services/GameState.js';

/**
 * Fase 2 (prompt 3) — Tienda de disfraces de Corchito. Los botones de aquí
 * llaman directo a gameState.buySkin()/equipSkin(), los mismos métodos que ya
 * persisten en Supabase desde el prompt 1 — no hay lógica de compra separada
 * ni nada cosmético-only: el buff de cada disfraz se aplica de verdad en
 * GameState (XP/Gemas) y CourseEngine (pista, umbral de racha).
 */
export class ShopModal {
  constructor(containerEl, onClose) {
    this.container = containerEl;
    this.onClose = onClose;
    this.unsubscribe = gameState.subscribe(() => this.render());
    this.render();
  }

  render() {
    if (!this.container) return;
    const state = gameState.state;

    this.container.innerHTML = `
      <div class="modal-overlay" id="shop-modal-overlay">
        <div class="modal-content glass-panel">
          <button id="btn-close-shop" class="modal-close-btn" aria-label="Cerrar Tienda">&#x2715;</button>

          <div class="cava-header">
            <div>
              <h2 class="cava-title">Tienda de Corchito</h2>
              <p class="cava-subtitle">Disfraces con poderes reales: cada buff afecta tu progreso de verdad, no es solo estético.</p>
            </div>
          </div>

          <div class="skin-list">
            ${SKINS_CATALOG.map(skin => this.renderSkinCard(skin, state)).join('')}
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  renderSkinCard(skin, state) {
    const isPurchased = state.purchasedSkinIds.includes(skin.id);
    const isEquipped = state.currentSkinId === skin.id;
    const canAfford = state.gems >= skin.price;

    let actionHtml;
    if (isEquipped) {
      actionHtml = `<div class="skin-price owned-tag">Equipado</div>`;
    } else if (isPurchased) {
      actionHtml = `<button class="skin-equip-btn" data-action="equip" data-skin="${skin.id}">Equipar</button>`;
    } else {
      actionHtml = `
        <button class="skin-buy-btn" data-action="buy" data-skin="${skin.id}" ${canAfford ? '' : 'disabled'}>
          💎 ${skin.price}
        </button>
      `;
    }

    return `
      <div class="skin-card ${isEquipped ? 'owned' : ''}">
        <div class="skin-ic">${skin.icon}</div>
        <div class="skin-info">
          <div class="skin-name">${skin.name}</div>
          <div class="skin-desc">${skin.buffTitle}</div>
        </div>
        ${actionHtml}
      </div>
    `;
  }

  bindEvents() {
    this.container.querySelectorAll('[data-action="buy"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const skin = SKINS_CATALOG.find(s => s.id === btn.dataset.skin);
        if (skin) gameState.buySkin(skin.id, skin.price);
      });
    });

    this.container.querySelectorAll('[data-action="equip"]').forEach(btn => {
      btn.addEventListener('click', () => {
        gameState.equipSkin(btn.dataset.skin);
      });
    });

    this.container.querySelector('#btn-close-shop')
      ?.addEventListener('click', () => this.close());

    this.container.querySelector('#shop-modal-overlay')
      ?.addEventListener('click', (e) => {
        if (e.target.id === 'shop-modal-overlay') this.close();
      });
  }

  close() {
    if (this.unsubscribe) this.unsubscribe();
    if (this.container) this.container.innerHTML = '';
    if (this.onClose) this.onClose();
  }
}
