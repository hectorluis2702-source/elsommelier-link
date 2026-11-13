import gsap from 'gsap';
import { BOOK_BRIDGE } from '../data/vinotiposData.js';

/**
 * Fase 2 (prompt 3) — Revelación del "Vinotipo" al completar las 5 regiones.
 * Reutiliza el mismo lenguaje de suspenso GSAP que BottleReveal (pulso de
 * brillo ~1.2s, nunca más de 2s) y cierra con el puente hacia el libro
 * "Dime tu Carácter — Héctor García, El Sommelier RD".
 */
export class VinotipoReveal {
  constructor(containerEl, vinotipo, onDone) {
    this.container = containerEl;
    this.vinotipo = vinotipo;
    this.onDone = onDone;
    this.timeline = null;
    this.render();
  }

  render() {
    if (!this.container) return;
    const v = this.vinotipo;

    this.container.innerHTML = `
      <div class="vinotipo-reveal-stage">
        <div class="vinotipo-reveal-mystery" id="vinotipo-reveal-mystery">🍇</div>
        <div class="vinotipo-reveal-card" id="vinotipo-reveal-card">
          <span class="vinotipo-reveal-eyebrow">Curso completo · Tu Vinotipo es</span>
          <span class="vinotipo-reveal-emoji">${v.emoji}</span>
          <h3 class="vinotipo-reveal-name">${v.name}</h3>
          <p class="vinotipo-reveal-tagline">${v.tagline}</p>
          <p class="vinotipo-reveal-desc">${v.description}</p>
          <div class="vinotipo-reveal-book">
            📖 ${BOOK_BRIDGE.line} <strong>"${BOOK_BRIDGE.title}"</strong> — ${BOOK_BRIDGE.author}
          </div>
        </div>
      </div>
      <button id="vinotipo-reveal-close" class="btn-header ce-action-btn" style="visibility:hidden;">
        Descubrí mi Vinotipo
      </button>
    `;

    this.animate();

    this.container.querySelector('#vinotipo-reveal-close')
      ?.addEventListener('click', () => { if (this.onDone) this.onDone(); });
  }

  animate() {
    const mystery = this.container.querySelector('#vinotipo-reveal-mystery');
    const card = this.container.querySelector('#vinotipo-reveal-card');
    const closeBtn = this.container.querySelector('#vinotipo-reveal-close');
    if (!mystery || !card) return;

    gsap.set(card, { opacity: 0, scale: 0.82, y: 14 });

    this.timeline = gsap.timeline();
    this.timeline
      // Suspenso: ~1.2s de brillo, igual que la revelacion de botellas.
      .to(mystery, {
        scale: 1.2,
        boxShadow: '0 0 50px rgba(184,134,11,0.9)',
        duration: 0.55,
        repeat: 1,
        yoyo: true,
        ease: 'sine.inOut'
      })
      .to(mystery, { opacity: 0, scale: 0.6, duration: 0.25, ease: 'power1.in' })
      .to(card, { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: 'back.out(1.6)' }, '-=0.05')
      .call(() => { if (closeBtn) closeBtn.style.visibility = 'visible'; });
  }

  destroy() {
    if (this.timeline) this.timeline.kill();
  }
}
