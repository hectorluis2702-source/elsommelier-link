import { gameState } from '../services/GameState.js';
import { Corchito } from './Corchito.js';

/**
 * AgeGate — Fase 2 (obligatorio, no opcional).
 * Se muestra en el primer uso hasta que el usuario confirme ser mayor de edad.
 * Si responde que no, bloquea el acceso al resto de la app con un mensaje respetuoso.
 *
 * Sistema Visual v2: antes de la pregunta real hay un "momento de deseo"
 * (splash cinemático con Corchito, mapa de fondo sutil) — puramente visual,
 * la verificación de edad sigue siendo el único paso que de verdad desbloquea
 * la app (ver renderQuestion/handleYes/handleNo, sin cambios de lógica).
 */
export class AgeGate {
  constructor(containerEl, onVerified) {
    this.container = containerEl;
    this.onVerified = onVerified;
    this.corchito = null;
    this.renderSplash();
  }

  // ==========================================================================
  // Paso 1 — Momento de deseo (solo visual, no decide nada por sí mismo)
  // ==========================================================================
  renderSplash() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="age-splash-overlay">
        <div class="age-splash-map-texture"></div>
        <div class="age-splash-glow"></div>
        <div class="age-splash-content">
          <div id="age-splash-corchito" class="age-splash-corchito"></div>
          <p class="age-splash-eyebrow">El Sommelier RD presenta</p>
          <h1 class="age-splash-title">Un mundo<br>por descorchar</h1>
          <p class="age-splash-sub">
            Cinco regiones, un centenar de secretos y un guía de corcho que no se calla nada.
          </p>
          <button id="age-splash-cta" class="btn-header age-splash-cta">Entrar a la cava</button>
          <p id="age-splash-ghost" class="age-splash-ghost">Confirmar mi edad para continuar</p>
          <p class="age-splash-legal">
            Contenido educativo. Bebe con responsabilidad. Prohibida su venta o consumo a menores de edad.
          </p>
        </div>
      </div>
    `;

    const corchitoSlot = this.container.querySelector('#age-splash-corchito');
    if (corchitoSlot) {
      this.corchito = new Corchito(corchitoSlot);
      this.corchito.setState('idle');
    }

    const goToQuestion = () => {
      this.destroyCorchito();
      this.renderQuestion();
    };

    this.container.querySelector('#age-splash-cta')?.addEventListener('click', goToQuestion);
    this.container.querySelector('#age-splash-ghost')?.addEventListener('click', goToQuestion);
  }

  // ==========================================================================
  // Paso 2 — La pregunta real (esto es lo único que bloquea/desbloquea la app)
  // ==========================================================================
  renderQuestion() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="age-gate-overlay">
        <div class="age-gate-panel glass-panel">
          <div id="age-gate-corchito" class="age-gate-corchito"></div>
          <h1 class="age-gate-title">Un momento antes de brindar</h1>
          <p class="age-gate-text">
            Vinotipos enseña sobre el mundo del vino con fines exclusivamente educativos
            y culturales: regiones, terroir, varietales y maridaje. Para continuar
            necesitamos confirmar tu edad.
          </p>
          <p class="age-gate-question">¿Tienes 18 años o más?</p>
          <div class="age-gate-actions">
            <button id="age-gate-yes" class="btn-header age-gate-btn-yes">Sí, soy mayor de edad</button>
            <button id="age-gate-no" class="age-gate-btn-no">No, soy menor de edad</button>
          </div>
          <p class="age-gate-disclaimer">
            Este contenido es educativo. Bebe con responsabilidad. Prohibida su venta o
            consumo a menores de edad.
          </p>
        </div>
      </div>
    `;

    const corchitoSlot = this.container.querySelector('#age-gate-corchito');
    if (corchitoSlot) {
      this.corchito = new Corchito(corchitoSlot);
      this.corchito.setState('idle', '¡Salud!');
    }

    this.container.querySelector('#age-gate-yes')
      .addEventListener('click', () => this.handleYes());

    this.container.querySelector('#age-gate-no')
      .addEventListener('click', () => this.handleNo());
  }

  handleYes() {
    gameState.confirmAgeVerification(true);
    this.destroyCorchito();
    this.container.innerHTML = '';
    if (this.onVerified) this.onVerified();
  }

  handleNo() {
    gameState.confirmAgeVerification(false);
    this.destroyCorchito();
    this.renderBlocked();
  }

  renderBlocked() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="age-gate-overlay">
        <div class="age-gate-panel glass-panel">
          <h1 class="age-gate-title">Gracias por tu honestidad</h1>
          <p class="age-gate-text">
            Vinotipos es una plataforma educativa sobre el mundo del vino, pensada para
            personas mayores de edad. Te esperamos aquí cuando cumplas los 18 años.
          </p>
          <p class="age-gate-disclaimer">
            Este contenido es educativo. Bebe con responsabilidad. Prohibida su venta o
            consumo a menores de edad.
          </p>
        </div>
      </div>
    `;
  }

  destroyCorchito() {
    if (this.corchito) {
      this.corchito.destroy();
      this.corchito = null;
    }
  }
}
