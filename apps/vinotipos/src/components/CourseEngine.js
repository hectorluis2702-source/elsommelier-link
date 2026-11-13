import { gameState } from '../services/GameState.js';
import { Corchito } from './Corchito.js';
import { BottleReveal } from './BottleReveal.js';
import { VinotipoReveal } from './VinotipoReveal.js';
import { audioEngine } from './AudioEngine.js';
import { buildSessionQuestions, isFreeAnswerCorrect } from '../services/questionGenerator.js';
import { pickPhrase, PHRASES } from '../data/corchitoPhrases.js';
import { mountCertificatePreview } from './Certificate.js';
import { VINOTIPOS_CATALOG } from '../data/vinotiposData.js';

const SESSION_SIZE = 5;
// skin_vendimiador ("Escudo de Racha"): sube el umbral de racha_fallos de 2 a 3.
const RACHA_FALLOS_THRESHOLD_DEFAULT = 2;
const RACHA_FALLOS_THRESHOLD_SHIELDED = 3;
// Mismo costo que GameState.refreshLivesWithGems (constante duplicada a
// propósito, mismo patrón que STREAK_FREEZE_COST en StreakBanner.js — solo
// para mostrar el precio en el botón; el cobro real vive en GameState).
const LIVES_REFRESH_COST = 20;

/**
 * CourseEngine — Fase 2 (prompt 2). Motor real de preguntas de maridaje/terroir.
 *
 * Se abre desde WorldMap para una región ya desbloqueada. Cada pregunta se
 * genera con questionGenerator.js a partir de la info real de terroirInfo, se
 * responde, se persiste en Supabase vía gameState.recordAnswer(), y al cerrar
 * la sesión gameState.completeChallengeSession() decide racha/vidas/desbloqueos.
 */
export class CourseEngine {
  constructor(containerEl, region, { onClose } = {}) {
    this.container = containerEl;
    this.region = region;
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
    // Token que invalida el setTimeout de auto-avance si el jugador cierra
    // el reto (o llega otra respuesta) antes de que se cumplan los ~900ms.
    this.autoAdvanceToken = 0;

    this.offBottleUnlock = gameState.on('bottle:unlocked', (bottle) => {
      this.pendingBottleReveal = bottle;
    });

    this.start();
  }

  async start() {
    if (gameState.state.lives <= 0) {
      this.renderBlocked();
      return;
    }

    this.renderLoading();

    const reviewRegion = await gameState.getDueReviewRegion();
    const filteredReview = reviewRegion && reviewRegion.id !== this.region.id ? reviewRegion : null;
    this.questions = buildSessionQuestions(this.region, { reviewRegion: filteredReview, count: SESSION_SIZE });

    this.renderShell();
    this.renderQuestion();
  }

  // ==========================================================================
  // Render: shell + estados especiales
  // ==========================================================================
  renderLoading() {
    if (!this.container) return;
    this.container.innerHTML = `
      <div class="modal-overlay" id="ce-overlay">
        <div class="modal-content glass-panel">
          <p class="ce-loading">Corchito está preparando el reto…</p>
        </div>
      </div>
    `;
  }

  // Pantalla "Sin Vidas" (Sistema Visual v2) — tono de animo, nunca de culpa:
  // temporizador real hasta el reinicio diario + refresco real con Gemas.
  renderBlocked() {
    if (!this.container) return;
    this.clearBlockedTimer();

    const canAfford = gameState.state.gems >= LIVES_REFRESH_COST;

    this.container.innerHTML = `
      <div class="modal-overlay" id="ce-overlay">
        <div class="modal-content glass-panel ce-panel ce-blocked-panel">
          <button id="ce-close" class="modal-close-btn" aria-label="Cerrar">&#x2715;</button>
          <div id="ce-corchito-slot" class="corchito-modal-slot ce-blocked-corchito"></div>
          <h3 class="ce-blocked-title">Corchito necesita<br>un respiro</h3>
          <p class="ce-blocked-text">${pickPhrase(PHRASES.sinVidas)}</p>
          <div class="ce-blocked-timer" id="ce-blocked-timer" aria-live="polite">--:--:--</div>
          <button id="ce-refresh-lives" class="btn-header ce-blocked-refresh-btn" ${canAfford ? '' : 'disabled'}>
            💎 Refrescar con ${LIVES_REFRESH_COST} Gemas
          </button>
          <p class="ce-blocked-ghost">Esperar el reinicio diario</p>
        </div>
      </div>
    `;

    const slot = this.container.querySelector('#ce-corchito-slot');
    if (slot) {
      this.corchito = new Corchito(slot);
      this.corchito.setState('bloqueado');
    }

    this.bindOverlayClose();
    this.startBlockedTimer();

    this.container.querySelector('#ce-refresh-lives')?.addEventListener('click', () => {
      const refreshed = gameState.refreshLivesWithGems(LIVES_REFRESH_COST);
      if (refreshed) {
        this.clearBlockedTimer();
        this.start();
      }
    });
  }

  // Cuenta regresiva real hasta el proximo reinicio diario (medianoche UTC,
  // el mismo limite que usa GameState.ensureFreshDay). Al llegar a 0, intenta
  // el reinicio de verdad — si funciona, arranca la sesion sola.
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
      const timerEl = this.container?.querySelector('#ce-blocked-timer');
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
      <div class="modal-overlay" id="ce-overlay">
        <div class="modal-content glass-panel ce-panel">
          <button id="ce-close" class="modal-close-btn" aria-label="Cerrar reto">&#x2715;</button>

          <div class="ce-header">
            <div id="ce-corchito-slot" class="corchito-modal-slot"></div>
            <div class="ce-progress">
              <span class="ce-progress-label">${this.region.flag} ${this.region.name}</span>
              <div class="ce-progress-dots" id="ce-progress-dots"></div>
            </div>
          </div>

          <div id="ce-body" class="ce-body"></div>
        </div>
      </div>
    `;

    const slot = this.container.querySelector('#ce-corchito-slot');
    if (slot) {
      this.corchito = new Corchito(slot);
      this.corchito.setState('idle');
    }

    this.bindOverlayClose();
    this.renderProgressDots();
  }

  renderProgressDots() {
    const el = this.container.querySelector('#ce-progress-dots');
    if (!el) return;
    el.innerHTML = this.questions.map((q, i) => {
      const cls = i < this.currentIndex ? 'ce-dot-done' : i === this.currentIndex ? 'ce-dot-current' : '';
      return `<span class="ce-dot ${cls}" title="Nivel ${q.level}${q.isReview ? ' · Repaso' : ''}"></span>`;
    }).join('');
  }

  bindOverlayClose() {
    this.container.querySelector('#ce-close')?.addEventListener('click', () => this.exitSession());
  }

  exitSession() {
    if (this.onClose) this.onClose();
  }

  // ==========================================================================
  // Pregunta activa
  // ==========================================================================
  renderQuestion() {
    const body = this.container.querySelector('#ce-body');
    if (!body) return;

    this.answered = false;
    this.selectedOption = null;
    const q = this.questions[this.currentIndex];

    // skin_enologo ("Pista Química Gratis"): oculta 1 opcion incorrecta en
    // preguntas de 4 opciones. Es un efecto REAL sobre las opciones que se
    // muestran, no cosmetico — se calcula una sola vez por pregunta.
    const hasFreeHint = q.inputType === 'choice' && q.options.length > 2
      && gameState.getEquippedSkin().id === 'skin_enologo';
    const visibleOptions = hasFreeHint ? this.applyFreeHint(q) : q.options;

    body.innerHTML = `
      ${q.isReview ? `<div class="ce-review-tag">🔄 Repaso — vuelve a aparecer porque ya la dominabas</div>` : ''}
      ${hasFreeHint ? `<div class="ce-hint-tag">🥼 Pista del Enólogo: 1 opción incorrecta oculta</div>` : ''}

      ${q.hasImage
        ? `<div class="ce-image-frame">${q.imageEmoji}</div>`
        : `<div class="ce-description-box">${q.descriptionText}</div>`
      }

      <p class="ce-prompt">${q.prompt}</p>

      <div id="ce-answer-area" class="ce-answer-area">
        ${q.inputType === 'choice'
          ? visibleOptions.map((opt) => `<button class="ce-option" data-option="${this.escapeAttr(opt)}">${opt}</button>`).join('')
          : `<input type="text" id="ce-text-input" class="ce-text-input" placeholder="Escribe el varietal…" autocomplete="off" />`
        }
      </div>

      <div id="ce-feedback" class="ce-feedback" style="display:none;"></div>

      <button id="ce-action-btn" class="btn-header ce-action-btn">Comprobar</button>
    `;

    this.renderProgressDots();
    this.bindQuestionEvents(q);
  }

  // Quita al azar UNA opcion incorrecta de la lista (nunca la correcta).
  applyFreeHint(q) {
    const wrongOptions = q.options.filter(opt => opt !== q.correctAnswer);
    if (wrongOptions.length === 0) return q.options;
    const toHide = wrongOptions[Math.floor(Math.random() * wrongOptions.length)];
    return q.options.filter(opt => opt !== toHide);
  }

  escapeAttr(str) {
    return String(str).replace(/"/g, '&quot;');
  }

  bindQuestionEvents(q) {
    const actionBtn = this.container.querySelector('#ce-action-btn');

    if (q.inputType === 'choice') {
      this.container.querySelectorAll('.ce-option').forEach(btn => {
        btn.addEventListener('click', () => {
          if (this.answered) return;
          this.container.querySelectorAll('.ce-option').forEach(b => b.classList.remove('ce-option-selected'));
          btn.classList.add('ce-option-selected');
          this.selectedOption = btn.dataset.option;
        });
      });
    } else {
      const input = this.container.querySelector('#ce-text-input');
      input?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') this.handleAction(q);
      });
      input?.focus();
    }

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
    let isCorrect;
    if (q.inputType === 'choice') {
      if (this.selectedOption === null) return; // exige elegir una opcion
      isCorrect = this.selectedOption === q.correctAnswer;
    } else {
      const input = this.container.querySelector('#ce-text-input');
      isCorrect = isFreeAnswerCorrect(q, input ? input.value : '');
    }

    this.answered = true;
    this.lockAnswerUI(q, isCorrect);

    const result = await gameState.recordAnswer({ regionId: q.regionId, level: q.level, isCorrect });

    // skin_vendimiador ("Escudo de Racha"): sube el umbral de racha_fallos de
    // 2 a 3 fallos seguidos — efecto real sobre CUANDO se dispara ese estado.
    const rachaThreshold = gameState.getEquippedSkin().id === 'skin_vendimiador'
      ? RACHA_FALLOS_THRESHOLD_SHIELDED
      : RACHA_FALLOS_THRESHOLD_DEFAULT;

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
      const isRachaFallos = result.consecutiveErrors >= rachaThreshold;
      const phrase = isRachaFallos ? pickPhrase(PHRASES.rachaFallos) : pickPhrase(PHRASES.fallo);
      this.corchito?.setState(isRachaFallos ? 'racha_fallos' : 'fallo', phrase);
      this.corchito?.playCorchitoReaction('fallo', { isRachaFallos });
    }

    this.showFeedback(q, isCorrect);

    const actionBtn = this.container.querySelector('#ce-action-btn');

    if (isCorrect) {
      // Auto-avance: el feedback de "¡Correcto!" ya comunica el resultado,
      // asi que no pedimos un toque manual — Corchito reacciona y ~900ms
      // despues seguimos solos a la siguiente pregunta.
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
      // Fallo: el jugador necesita tiempo para leer por que fallo, nunca lo
      // apuramos — se queda el boton manual "Continuar".
      if (actionBtn) actionBtn.textContent = result.lives <= 0 ? 'Ver resumen' : 'Continuar';
    }
  }

  // Fase 2 (prompt 3): estos numeros deben coincidir EXACTO con lo que
  // GameState.addXP/addGems realmente persiste (incluye el buff del skin
  // equipado) — si no, el resumen mentiría sobre lo que se guardó.
  xpForLevel(level) {
    const base = { 1: 10, 2: 15, 3: 25 }[level] || 10;
    return Math.round(base * gameState.getXpBonusMultiplier());
  }

  gemsForLevel(level) {
    const base = { 1: 2, 2: 3, 3: 5 }[level] || 2;
    return Math.round(base * gameState.getGemsBonusMultiplier());
  }

  lockAnswerUI(q, isCorrect) {
    if (q.inputType === 'choice') {
      this.container.querySelectorAll('.ce-option').forEach(btn => {
        btn.disabled = true;
        const opt = btn.textContent;
        if (opt === q.correctAnswer) btn.classList.add('ce-option-correct');
        else if (btn.classList.contains('ce-option-selected') && !isCorrect) btn.classList.add('ce-option-wrong');
      });
    } else {
      const input = this.container.querySelector('#ce-text-input');
      if (input) input.disabled = true;
    }
  }

  showFeedback(q, isCorrect) {
    const feedback = this.container.querySelector('#ce-feedback');
    if (!feedback) return;
    feedback.style.display = '';
    feedback.className = `ce-feedback ${isCorrect ? 'ce-feedback-ok' : 'ce-feedback-bad'}`;
    feedback.innerHTML = isCorrect
      ? `<strong>¡Correcto!</strong> +${this.xpForLevel(q.level)} XP · +${this.gemsForLevel(q.level)} 💎`
      : `<strong>No era esa.</strong> La respuesta correcta era: <em>${q.correctAnswer}</em>`;
  }

  // ==========================================================================
  // Avance de sesión
  // ==========================================================================
  async advance() {
    if (this.destroyed) return;

    if (gameState.state.lives <= 0) {
      await this.finishSession(true);
      return;
    }

    if (this.pendingBottleReveal) {
      // Corchito se queda quieto, expectante, antes de que aparezca la botella.
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
    const body = this.container.querySelector('#ce-body');
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
    const sessionResult = await gameState.completeChallengeSession();
    if (this.destroyed) return;
    const body = this.container.querySelector('#ce-body');
    if (!body) return;

    // Reto completado de verdad (no interrumpido por falta de vidas): saltos
    // de celebracion + confeti antes de mostrar el resumen.
    if (!outOfLives) {
      await this.corchito?.playCorchitoReaction('celebracion');
      if (this.destroyed) return;
    }

    // Preguntas realmente respondidas: si se quedo sin vidas, la actual (indice
    // corriente) ya cuenta; si termino normal, se respondieron todas.
    const attempted = outOfLives ? this.currentIndex + 1 : this.questions.length;

    // Fase 2 (prompt 3): si el curso quedo completo (5 regiones al 80%+) y es
    // la primera vez, revelamos el Vinotipo ANTES del resumen — momento aparte,
    // con su propio suspenso GSAP. revealVinotipoIfNeeded() devuelve null si
    // ya se habia revelado en una sesion anterior.
    const vinotipo = sessionResult.courseComplete
      ? await gameState.revealVinotipoIfNeeded()
      : null;

    if (vinotipo) {
      if (this.destroyed) return;
      // Mismo lenguaje de suspenso que antes de una botella, ahora sobre el
      // momento del Vinotipo.
      await this.corchito?.playCorchitoReaction('suspenso');
      if (this.destroyed) return;
      body.innerHTML = '';
      new VinotipoReveal(body, vinotipo, () => {
        this.renderSessionSummary(outOfLives, attempted, sessionResult);
      });
      return;
    }

    this.renderSessionSummary(outOfLives, attempted, sessionResult);
  }

  renderSessionSummary(outOfLives, attempted, sessionResult) {
    const body = this.container.querySelector('#ce-body');
    if (!body) return;

    const closingPhrase = outOfLives
      ? pickPhrase(PHRASES.sinVidas)
      : sessionResult.newlyUnlockedRegions.length
        ? pickPhrase(PHRASES.desbloqueoRegion)
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

        ${sessionResult.newlyUnlockedRegions.length
          ? `<div class="ce-unlock-banner">🗺️ ¡Nueva región desbloqueada: ${sessionResult.newlyUnlockedRegions.map(r => r.name).join(', ')}!</div>`
          : ''
        }

        ${sessionResult.streakChanged === 'extended' || sessionResult.streakChanged === 'started'
          ? `<div class="ce-streak-banner">🔥 Racha: ${sessionResult.streak} días</div>`
          : sessionResult.streakChanged === 'frozen'
            ? `<div class="ce-streak-banner">🧊 Un "Congelar Racha" cubrió el día que faltaste. Racha: ${sessionResult.streak} días</div>`
            : ''
        }

        ${gameState.state.vinotipoType && VINOTIPOS_CATALOG[gameState.state.vinotipoType]
          ? `<div class="ce-vinotipo-badge">${VINOTIPOS_CATALOG[gameState.state.vinotipoType].emoji} Tu Vinotipo: <strong>${VINOTIPOS_CATALOG[gameState.state.vinotipoType].name}</strong></div>`
          : ''
        }

        <div id="ce-certificate-slot"></div>

        <button id="ce-summary-close" class="btn-header ce-action-btn">Cerrar</button>
      </div>
    `;

    if (sessionResult.courseComplete) {
      mountCertificatePreview(this.container.querySelector('#ce-certificate-slot'));
    }

    this.container.querySelector('#ce-summary-close')?.addEventListener('click', () => this.exitSession());
  }

  destroy() {
    this.destroyed = true;
    this.autoAdvanceToken += 1;
    this.clearBlockedTimer();
    if (this.offBottleUnlock) this.offBottleUnlock();
    if (this.corchito) this.corchito.destroy();
  }
}
