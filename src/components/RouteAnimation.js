import gsap from 'gsap';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';

gsap.registerPlugin(MotionPathPlugin);

/**
 * Fase 2 (prompt 2) — Cuando se desbloquea una region nueva, Corchito viaja
 * visualmente sobre un path SVG desde la region donde estaba hasta la nueva
 * (2.2-2.5s de recorrido). Se monta como una capa temporal encima del mapa y
 * se autodestruye sola al terminar.
 *
 * Las expresiones de Corchito (idle/acierto/fallo) siguen siendo CSS puro —
 * esto es una coreografia aparte, un marcador viajando por un mapa.
 */
export class RouteAnimation {
  constructor(hostEl, { from, to, onComplete } = {}) {
    this.hostEl = hostEl;
    this.from = from;
    this.to = to;
    this.onComplete = onComplete;
    this.overlayEl = null;
    this.timeline = null;
    this.play();
  }

  play() {
    if (!this.hostEl || !this.from || !this.to || !this.from.coords || !this.to.coords) {
      if (this.onComplete) this.onComplete();
      return;
    }

    const { x: x1, y: y1 } = this.from.coords;
    const { x: x2, y: y2 } = this.to.coords;

    // Punto de control perpendicular al segmento para que la ruta se vea como
    // un arco de viaje real, no una linea recta.
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.hypot(dx, dy) || 1;
    const curveOffset = 14;
    const ctrlX = (x1 + x2) / 2 + (-dy / len) * curveOffset;
    const ctrlY = (y1 + y2) / 2 + (dx / len) * curveOffset;

    const pathId = `route-path-${Date.now()}`;

    this.overlayEl = document.createElement('div');
    this.overlayEl.className = 'map-route-overlay';
    this.overlayEl.innerHTML = `
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" class="map-route-svg">
        <defs>
          <linearGradient id="${pathId}-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#B8860B" />
            <stop offset="100%" stop-color="#F5EFE0" />
          </linearGradient>
        </defs>
        <path id="${pathId}" d="M ${x1} ${y1} Q ${ctrlX} ${ctrlY} ${x2} ${y2}"
              fill="none" stroke="url(#${pathId}-grad)" stroke-width="0.6"
              stroke-dasharray="2.2 2.2" />
        <circle class="map-route-dot" cx="${x1}" cy="${y1}" r="1.3" />
        <circle class="map-route-dot" cx="${x2}" cy="${y2}" r="1.3" />
      </svg>
      <div class="map-route-marker">🍾</div>
      <div class="map-route-caption">Corchito viaja a ${this.to.name}…</div>
    `;

    this.hostEl.appendChild(this.overlayEl);

    const marker = this.overlayEl.querySelector('.map-route-marker');
    const pathEl = this.overlayEl.querySelector(`#${pathId}`);

    this.timeline = gsap.timeline({ onComplete: () => this.finish() });

    this.timeline
      .fromTo(this.overlayEl, { opacity: 0 }, { opacity: 1, duration: 0.25 })
      .set(marker, {
        motionPath: { path: pathEl, align: pathEl, alignOrigin: [0.5, 0.5], start: 0, end: 0 }
      })
      .to(marker, {
        motionPath: { path: pathEl, align: pathEl, alignOrigin: [0.5, 0.5], start: 0, end: 1 },
        duration: 2.4,
        ease: 'power1.inOut'
      })
      .to(this.overlayEl, { opacity: 0, duration: 0.35 }, '+=0.25');
  }

  finish() {
    if (this.overlayEl && this.overlayEl.parentNode) {
      this.overlayEl.parentNode.removeChild(this.overlayEl);
    }
    this.overlayEl = null;
    if (this.onComplete) this.onComplete();
  }

  destroy() {
    if (this.timeline) this.timeline.kill();
    if (this.overlayEl && this.overlayEl.parentNode) {
      this.overlayEl.parentNode.removeChild(this.overlayEl);
      this.overlayEl = null;
    }
  }
}
