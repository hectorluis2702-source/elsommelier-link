import gsap from 'gsap';
import { BOTTLES_CATALOG } from '../data/cavaData.js';
import { gameState } from '../services/GameState.js';
import { pickPhrase, PHRASES } from '../data/corchitoPhrases.js';
import { audioEngine } from './AudioEngine.js';

const SURPRISE_CHANCE = 0.15;

/**
 * Fase 2 (prompt 2) — Revelación con suspenso de una botella recién
 * desbloqueada en la Cava. Se monta DENTRO del panel que ya tenga abierto
 * quien la invoque (típicamente CourseEngine, justo tras un acierto) en vez
 * de pelear por su propio modal.
 *
 * 15% de las veces, en lugar de la botella esperada, Corchito "se distrae" y
 * muestra otra botella que el jugador ya tiene desbloqueada de otra región
 * visitada — nunca inventa un desbloqueo nuevo, solo cambia el foco de la
 * celebración.
 */
export class BottleReveal {
  constructor(containerEl, expectedBottle, onDone) {
    this.container = containerEl;
    this.expectedBottle = expectedBottle;
    this.onDone = onDone;
    this.timeline = null;
    this.render();
  }

  pickRevealBottle() {
    const pool = gameState.state.unlockedBottleIds
      .filter(id => id !== this.expectedBottle.id)
      .map(id => BOTTLES_CATALOG.find(b => b.id === id))
      .filter(Boolean);

    if (pool.length > 0 && Math.random() < SURPRISE_CHANCE) {
      return { bottle: pool[Math.floor(Math.random() * pool.length)], isSurprise: true };
    }
    return { bottle: this.expectedBottle, isSurprise: false };
  }

  render() {
    if (!this.container) return;
    const { bottle, isSurprise } = this.pickRevealBottle();

    this.container.innerHTML = `
      <div class="bottle-reveal-stage">
        <div class="bottle-reveal-mystery" id="bottle-reveal-mystery">🎁</div>
        <div class="glass-panel bottle-card unlocked bottle-reveal-card" id="bottle-reveal-card">
          <div class="bottle-card-top">
            <span class="bottle-icon">${bottle.imageIcon}</span>
            <span class="brand-badge" style="background:${this.getRarityColor(bottle.rarity)};color:#FFF;">${bottle.rarity}</span>
          </div>
          <h3 class="bottle-name">${bottle.name}</h3>
          <div class="bottle-region">${bottle.region} &bull; ${bottle.type}</div>
          <p class="bottle-notes"><strong>Notas Sommelier:</strong> ${bottle.notes}</p>
          ${isSurprise ? `<div class="bottle-reveal-surprise-tag">✨ Sorpresa de tu Cava</div>` : ''}
        </div>
      </div>
      <p class="bottle-reveal-caption">
        ${isSurprise ? pickPhrase(PHRASES.revelacionBotellaSorpresa) : pickPhrase(PHRASES.revelacionBotella)}
      </p>
      <button id="bottle-reveal-close" class="btn-header bottle-reveal-close-btn" style="visibility:hidden;">
        Genial, seguimos
      </button>
    `;

    this.animate();

    this.container.querySelector('#bottle-reveal-close')
      ?.addEventListener('click', () => { if (this.onDone) this.onDone(); });
  }

  animate() {
    const mystery = this.container.querySelector('#bottle-reveal-mystery');
    const card = this.container.querySelector('#bottle-reveal-card');
    const closeBtn = this.container.querySelector('#bottle-reveal-close');
    if (!mystery || !card) return;

    gsap.set(card, { opacity: 0, scale: 0.85, y: 10 });

    this.timeline = gsap.timeline();
    this.timeline
      // Suspenso: pulso de brillo del "regalo" — 1.2s en total, nunca mas de 2s.
      .to(mystery, {
        scale: 1.15,
        boxShadow: '0 0 40px rgba(184,134,11,0.9)',
        duration: 0.5,
        repeat: 1,
        yoyo: true,
        ease: 'sine.inOut'
      })
      .to(mystery, { opacity: 0, scale: 0.7, duration: 0.2, ease: 'power1.in' })
      .call(() => audioEngine.playBottleReveal()) // sonido distinto y mas satisfactorio: el "premio"
      .to(card, { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: 'back.out(1.7)' }, '-=0.05')
      .call(() => { if (closeBtn) closeBtn.style.visibility = 'visible'; });
  }

  getRarityColor(rarity) {
    switch (rarity) {
      case 'Legendaria': return 'linear-gradient(135deg, #FFD700, #B8860B)';
      case 'Mitica':
      case 'Mítica': return 'linear-gradient(135deg, #9370DB, #4B0082)';
      case 'Epica':
      case 'Épica': return 'linear-gradient(135deg, #32CD32, #228B22)';
      default: return 'linear-gradient(135deg, #4682B4, #1E90FF)';
    }
  }

  destroy() {
    if (this.timeline) this.timeline.kill();
  }
}
