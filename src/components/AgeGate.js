import { gameState } from '../services/GameState.js';
import { Corchito } from './Corchito.js';

/**
 * AgeGate — Fase 2 (obligatorio, no opcional).
 * Se muestra en el primer uso hasta que el usuario confirme ser mayor de edad.
 * Si responde que no, bloquea el acceso al resto de la app con un mensaje respetuoso.
 */
export class AgeGate {
  constructor(containerEl, onVerified) {
    this.container = containerEl;
    this.onVerified = onVerified;
    this.corchito = null;
    this.render();
  }

  render() {
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
