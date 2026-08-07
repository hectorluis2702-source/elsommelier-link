import { gameState } from '../services/GameState.js';
import { Corchito } from './Corchito.js';
import { BottleReveal } from './BottleReveal.js';
import { audioEngine } from './AudioEngine.js';
import { buildPairingSessionQuestions } from '../services/questionGenerator.js';
import { pickPhrase, PHRASES } from '../data/corchitoPhrases.js';

const SESSION_SIZE = 5;
// Mismo umbral base que CourseEngine.RACHA_FALLOS_THRESHOLD_DEFAULT. Etapa 1
// no aplica el buff skin_vendimiador (Escudo de Racha) todavia — posible
// extension de una etapa futura del Restaurante, no del alcance de hoy.
const RACHA_FALLOS_THRESHOLD = 2;
// Mismo costo que GameState.refreshLivesWithGems (constante duplicada a
// proposito, igual que en CourseEngine.js — el cobro real vive en GameState).
const LIVES_REFRESH_COST = 20;

const DIFFICULTY_LABEL = { 1: '🍇 Uva', 2: '🥂 Copa', 3: '🛢️ Barrica' };

/**
 * RestaurantEngine — "El Restaurante de Corchito", Etapa 1 (trivia de
 * maridaje). Hermano de CourseEngine.js, NO una copia de su lógica de
 * negocio: reutiliza el mismo GameState (XP/Gemas/vidas/racha vía
 * gameState.recordPairingAnswer/completePairingSession, que a su vez llaman
 * a los mismos addXP/addGems/recordError/resetErrors/registerDailyActivity
 * de siempre), el mismo Corchito con sus animaciones GSAP y frases, el mismo
 * BottleReveal, y el mismo motor de pregunta armado en questionGenerator.js.
 *
 * Lo que SÍ se repite aquí es la coreografía de UI (shell del modal, avance
 * de preguntas, pantalla "Sin Vidas") porque CourseEngine.js está sellado
 * (Fase 2, no tocar sin permiso) y estructuralmente atado a `region`
 * (gate de 80%, repetición espaciada, Vinotipo, Certificado) — nada de eso
 * aplica a Etapa 1. Reutiliza además las mismas clases CSS `.ce-*` para que
 * se vea y se sienta igual al resto del juego.
 */
export class RestaurantEngine {
  constructor(containerEl, { onClose } = {}) {
    this.container = containerEl;
    this.onClose = onClose;

    this.corchito = null;
    this.questions = [];
    this.currentIndex = 0;
    this.correctCount = 0;
    this.correctStreakInSession = 0;
    this.xpEarned = 0;
    this.gemsEarned = 0;
    this.pendingBottleReveal = null;
    this.selectedOption = null;
    this.answered = false;
    this.blockedTimerInterval = null;
    this.destroyed = false;
    this.autoAdvanceToken = 0;

    this.offBottleUnlock = gameState.on('bottle:unlocked', (bottle) => {
      this.pendingBottleReveal = bottle;
    });

    this.start();
  }

  start() {
    if (gameState.state.lives <= 0) {
      this.renderBlocked();
      return;
    }

    this.questions = buildPairingSessionQuestions(SESSION_SIZE);
    this.renderShell();
    this.renderQuestion();
  }

  // ==========================================================================
  // Render: shell + estado "Sin Vidas" (mismo patrón que CourseEngine)
  // ==========================================================================
  renderBlocked() {
    if (!this.container) return;
    this.clearBlockedTimer();

    const canAfford = gameState.state.gems >= LIVES_REFRESH_COST;

    this.container.innerHTML = `
      <div class="modal-overlay" id="re-overlay">
        <div class="modal-content glass-panel ce-panel ce-blocked-panel">
          <button id="re-close" class="modal-close-btn" aria-label="Cerrar">&#x2715;</button>
          <div id="re-corchito-slot" class="corchito-modal-slot ce-blocked-corchito"></div>
          <h3 class="ce-blocked-title">Corchito necesita<br>un respiro</h3>
          <p class="ce-blocked-text">${pickPhrase(PHRASES.sinVidas)}</p>
          <div class="ce-blocked-timer" id="re-blocked-timer" aria-live="polite">--:--:--</div>
          <button id="re-refresh-lives" class="btn-header ce-blocked-refresh-btn" ${canAfford ? '' : 'disabled'}>
            💎 Refrescar con ${LIVES_REFRESH_COST} Gemas
          </button>
          <p class="ce-blocked-ghost">Esperar el reinicio diario</p>
        </div>
      </div>
    `;

    const slot = this.container.querySelector('#re-corchito-slot');
    if (slot) {
      this.corchito = new Corchito(slot);
      this.corchito.setState('bloqueado');
    }

    this.bindOverlayClose();
    this.startBlockedTimer();

    this.container.querySelector('#re-refresh-lives')?.addEventListener('click', () => {
      const refreshed = gameState.refreshLivesWithGems(LIVES_REFRESH_COST);
      if (refreshed) {
        this.clearBlockedTimer();
        this.start();
      }
    });
  }

  // Cuenta regresiva real hasta el reinicio diario (medianoche UTC) — igual
  // que CourseEngine.startBlockedTimer, mismo límite que GameState.ensureFreshDay.
  startBlockedTimer() {
    const tick = () => {
      const now = new Date();
      const nextMidnightUtc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0);
      const msLeft = nextMidnightUtc - now.getTime();

      if (msLeft <= 0) {
        this.clearBlockedTimer();
        gameState.ensureFreshDay();
        if (gameState.state.lives > 0) {
          this.start();
        } else {
          this.startBlockedTimer();
        }
        return;
      }

      const totalSeconds = Math.floor(msLeft / 1000);
      const h = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
      const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
      const s = String(totalSeconds % 60).padStart(2, '0');
      const timerEl = this.container?.querySelector('#re-blocked-timer');
      if (timerEl) timerEl.textContent = `${h}:${m}:${s}`;
    };

    tick();
    this.blockedTimerInterval = setInterval(tick, 1000);
  }

  clearBlockedTimer() {
    if (this.blockedTimerInterval) {
      clearInterval(this.blockedTimerInterval);
      this.blockedTimerInterval = null;
    }
  }

  renderShell() {
    if (!this.container) return;
    this.container.innerHTML = `
      <div class="modal-overlay" id="re-overlay">
        <div class="modal-content glass-panel ce-panel">
          <button id="re-close" class="modal-close-btn" aria-label="Cerrar reto">&#x2715;</button>

          <div class="ce-header">
            <div id="re-corchito-slot" class="corchito-modal-slot"></div>
            <div class="ce-progress">
              <span class="ce-progress-label">🍽️ El Restaurante de Corchito</span>
              <div class="ce-progress-dots" id="re-progress-dots"></div>
            </div>
          </div>

          <div id="re-body" class="ce-body"></div>
        </div>
      </div>
    `;

    const slot = this.container.querySelector('#re-corchito-slot');
    if (slot) {
      this.corchito = new Corchito(slot);
      this.corchito.setState('idle');
    }

    this.bindOverlayClose();
    this.renderProgressDots();
  }

  renderProgressDots() {
    const el = this.container.querySelector('#re-progress-dots');
    if (!el) return;
    el.innerHTML = this.questions.map((q, i) => {
      const cls = i < this.currentIndex ? 'ce-dot-done' : i === this.currentIndex ? 'ce-dot-current' : '';
      return `<span class="ce-dot ${cls}" title="${DIFFICULTY_LABEL[q.level] || ''}"></span>`;
    }).join('');
  }

  bindOverlayClose() {
    this.container.querySelector('#re-close')?.addEventListener('click', () => this.exitSession());
  }

  exitSession() {
    if (this.onClose) this.onClose();
  }

  // ==========================================================================
  // Pregunta activa
  // ==========================================================================
  renderQuestion() {
    const body = this.container.querySelector('#re-body');
    if (!body) return;

    this.answered = false;
    this.selectedOption = null;
    const q = this.questions[this.currentIndex];

    body.innerHTML = `
      <div class="ce-review-tag">${DIFFICULTY_LABEL[q.level] || ''}</div>

      <div class="ce-description-box">🍽️ ${q.descriptionText}</div>

      <p class="ce-prompt">${q.prompt}</p>

      <div id="re-answer-area" class="ce-answer-area">
        ${q.options.map((opt) => `<button class="ce-option" data-option="${this.escapeAttr(opt)}">${opt}</button>`).join('')}
      </div>

      <div id="re-feedback" class="ce-feedback" style="display:none;"></div>

      <button id="re-action-btn" class="btn-header ce-action-btn">Comprobar</button>
    `;

    this.renderProgressDots();
    this.bindQuestionEvents(q);
  }

  escapeAttr(str) {
    return String(str).replace(/"/g, '&quot;');
  }

  bindQuestionEvents(q) {
    const actionBtn = this.container.querySelector('#re-action-btn');

    this.container.querySelectorAll('.ce-option').forEach(btn => {
      btn.addEventListener('click', () => {
        if (this.answered) return;
        this.container.querySelectorAll('.ce-option').forEach(b => b.classList.remove('ce-option-selected'));
        btn.classList.add('ce-option-selected');
        this.selectedOption = btn.dataset.option;
      });
    });

    actionBtn?.addEventListener('click', () => this.handleAction(q));
  }

  handleAction(q) {
    if (!this.answered) {
      this.checkAnswer(q);
    } else {
      this.advance();
    }
  }

  async checkAnswer(q) {
    if (this.selectedOption === null) return; // exige elegir una opcion
    const isCorrect = this.selectedOption === q.correctAnswer;

    this.answered = true;
    this.lockAnswerUI(q, isCorrect);

    const result = await gameState.recordPairingAnswer({ dishId: q.dishId, level: q.level, isCorrect });

    if (isCorrect) {
      audioEngine.playCorrect();
      this.correctCount += 1;
      this.correctStreakInSession += 1;
      this.xpEarned += this.xpForLevel(q.level);
      this.gemsEarned += this.gemsForLevel(q.level);

      const phrase = this.correctStreakInSession >= 4
        ? pickPhrase(PHRASES.rachaAciertos4)
        : this.correctStreakInSession >= 2
          ? pickPhrase(PHRASES.rachaAciertos2)
          : pickPhrase(PHRASES.acierto);
      this.corchito?.setState('acierto', phrase);
      this.corchito?.playCorchitoReaction('acierto', { streak: this.correctStreakInSession });
    } else {
      audioEngine.playIncorrect();
      this.correctStreakInSession = 0;
      const isRachaFallos = result.consecutiveErrors >= RACHA_FALLOS_THRESHOLD;
      const phrase = isRachaFallos ? pickPhrase(PHRASES.rachaFallos) : pickPhrase(PHRASES.fallo);
      this.corchito?.setState(isRachaFallos ? 'racha_fallos' : 'fallo', phrase);
      this.corchito?.playCorchitoReaction('fallo', { isRachaFallos });
    }

    this.showFeedback(q, isCorrect);

    const actionBtn = this.container.querySelector('#re-action-btn');

    if (isCorrect) {
      // Auto-avance identico a CourseEngine: Corchito ya reacciono, no hace
      // falta un toque manual — seguimos solos a la siguiente pregunta.
      if (actionBtn) {
        actionBtn.style.display = 'none';
        actionBtn.disabled = true;
      }
      const advanceToken = ++this.autoAdvanceToken;
      window.setTimeout(() => {
        if (this.destroyed || advanceToken !== this.autoAdvanceToken) return;
        this.advance();
      }, 900);
    } else {
      // Fallo: tiempo para leer el "por qué" con calma, nunca se apura.
      if (actionBtn) actionBtn.textContent = result.lives <= 0 ? 'Ver resumen' : 'Continuar';
    }
  }

  // Mismos numeros/formula que CourseEngine.xpForLevel/gemsForLevel — deben
  // coincidir EXACTO con lo que gameState.recordPairingAnswer realmente
  // persiste (incluye el buff del skin equipado).
  xpForLevel(level) {
    const base = { 1: 10, 2: 15, 3: 25 }[level] || 10;
    return Math.round(base * gameState.getXpBonusMultiplier());
  }

  gemsForLevel(level) {
    const base = { 1: 2, 2: 3, 3: 5 }[level] || 2;
    return Math.round(base * gameState.getGemsBonusMultiplier());
  }

  lockAnswerUI(q, isCorrect) {
    this.container.querySelectorAll('.ce-option').forEach(btn => {
      btn.disabled = true;
      const opt = btn.textContent;
      if (opt === q.correctAnswer) btn.classList.add('ce-option-correct');
      else if (btn.classList.contains('ce-option-selected') && !isCorrect) btn.classList.add('ce-option-wrong');
    });
  }

  // El "por qué" en vocabulario SAT (requisito de Etapa 1): texto literal de
  // PAIRINGS_CATALOG vía q.justification, nunca generado aquí.
  showFeedback(q, isCorrect) {
    const feedback = this.container.querySelector('#re-feedback');
    if (!feedback) return;
    feedback.style.display = '';
    feedback.className = `ce-feedback ${isCorrect ? 'ce-feedback-ok' : 'ce-feedback-bad'}`;
    feedback.innerHTML = `
      ${isCorrect
        ? `<strong>¡Correcto!</strong> +${this.xpForLevel(q.level)} XP · +${this.gemsForLevel(q.level)} 💎`
        : `<strong>No era ese.</strong> El maridaje correcto era: <em>${q.correctAnswer}</em>`
      }
      <p class="re-justification">🍷 <strong>${q.mechanism}:</strong> ${q.justification}</p>
    `;
  }

  // ==========================================================================
  // Avance de sesión (identico en forma a CourseEngine.advance/showBottleReveal)
  // ==========================================================================
  async advance() {
    if (this.destroyed) return;

    if (gameState.state.lives <= 0) {
      await this.finishSession(true);
      return;
    }

    if (this.pendingBottleReveal) {
      await this.corchito?.playCorchitoReaction('suspenso');
      if (this.destroyed) return;
      this.showBottleReveal();
      return;
    }

    this.currentIndex += 1;
    if (this.currentIndex >= this.questions.length) {
      await this.finishSession(false);
    } else {
      this.renderQuestion();
    }
  }

  showBottleReveal() {
    const bottle = this.pendingBottleReveal;
    this.pendingBottleReveal = null;
    const body = this.container.querySelector('#re-body');
    if (!body) return;

    body.innerHTML = '';
    new BottleReveal(body, bottle, () => {
      if (gameState.state.lives <= 0) {
        this.finishSession(true);
      } else {
        this.currentIndex += 1;
        if (this.currentIndex >= this.questions.length) {
          this.finishSession(false);
        } else {
          this.renderQuestion();
        }
      }
    });
  }

  async finishSession(outOfLives) {
    const sessionResult = gameState.completePairingSession();
    if (this.destroyed) return;
    const body = this.container.querySelector('#re-body');
    if (!body) return;

    if (!outOfLives) {
      await this.corchito?.playCorchitoReaction('celebracion');
      if (this.destroyed) return;
    }

    const attempted = outOfLives ? this.currentIndex + 1 : this.questions.length;
    this.renderSessionSummary(outOfLives, attempted, sessionResult);
  }

  renderSessionSummary(outOfLives, attempted, sessionResult) {
    const body = this.container.querySelector('#re-body');
    if (!body) return;

    const closingPhrase = outOfLives
      ? pickPhrase(PHRASES.sinVidas)
      : sessionResult.challengesToday >= 3
        ? pickPhrase(PHRASES.cierreSesionLarga)
        : pickPhrase(PHRASES.cierreSesionNormal);

    this.corchito?.setState(outOfLives ? 'bloqueado' : 'acierto', closingPhrase);

    body.innerHTML = `
      <div class="ce-summary">
        <h3 class="ce-summary-title">${outOfLives ? 'Reto interrumpido' : 'Reto completado'}</h3>
        <div class="ce-summary-stats">
          <div class="ce-summary-stat"><span>${this.correctCount}/${attempted}</span><small>Aciertos</small></div>
          <div class="ce-summary-stat"><span>+${this.xpEarned}</span><small>XP</small></div>
          <div class="ce-summary-stat"><span>+${this.gemsEarned}</span><small>💎</small></div>
        </div>

        ${sessionResult.streakChanged === 'extended' || sessionResult.streakChanged === 'started'
          ? `<div class="ce-streak-banner">🔥 Racha: ${sessionResult.streak} días</div>`
          : sessionResult.streakChanged === 'frozen'
            ? `<div class="ce-streak-banner">🧊 Un "Congelar Racha" cubrió el día que faltaste. Racha: ${sessionResult.streak} días</div>`
            : ''
        }

        <button id="re-summary-close" class="btn-header ce-action-btn">Cerrar</button>
      </div>
    `;

    this.container.querySelector('#re-summary-close')?.addEventListener('click', () => this.exitSession());
  }

  destroy() {
    this.destroyed = true;
    this.autoAdvanceToken += 1;
    this.clearBlockedTimer();
    if (this.offBottleUnlock) this.offBottleUnlock();
    if (this.corchito) this.corchito.destroy();
  }
}
