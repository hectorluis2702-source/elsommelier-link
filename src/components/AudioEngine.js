/**
 * Fase 2 (prompt 3) — Motor de Efectos de Sonido Diegéticos Sintéticos.
 *
 * 100% Web Audio API (osciladores generados en código, sin archivos .mp3/.wav
 * que descargar): un breve arpegio para acierto/fallo, y una "mini fanfarria"
 * distinta y más satisfactoria para la revelación de botella (el premio).
 *
 * REGLA DE ORO: el audio es refuerzo, nunca información esencial. Todo aquí
 * está envuelto en try/catch y se auto-desactiva sin avisar si el navegador
 * bloquea el AudioContext (política de autoplay), si el dispositivo no
 * soporta Web Audio, o si el jugador lo silenció — en ningún caso el juego
 * debe fallar o bloquearse por esto.
 */

const MUTE_KEY = 'vinotipos_audio_muted_v1';

export class AudioEngine {
  constructor() {
    this.ctx = null;
    this.muted = this.loadMutePref();
  }

  loadMutePref() {
    try {
      return localStorage.getItem(MUTE_KEY) === '1';
    } catch (e) {
      return false;
    }
  }

  setMuted(muted) {
    this.muted = muted;
    try {
      localStorage.setItem(MUTE_KEY, muted ? '1' : '0');
    } catch (e) {
      // sin LocalStorage no se recuerda la preferencia, pero el toggle sigue funcionando en esta sesión
    }
  }

  toggleMuted() {
    this.setMuted(!this.muted);
    return this.muted;
  }

  ensureContext() {
    if (this.muted) return null;
    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return null;
        this.ctx = new AudioCtx();
      }
      if (this.ctx.state === 'suspended') {
        // Los navegadores exigen un gesto del usuario para iniciar audio: si
        // esto falla (todavia no hubo gesto, o el navegador lo bloquea del
        // todo), simplemente no suena — nunca lanzamos el error hacia arriba.
        this.ctx.resume().catch(() => {});
      }
      return this.ctx;
    } catch (e) {
      return null;
    }
  }

  /**
   * Reproduce un tono simple con envolvente suave (fade in/out) para evitar
   * "clics" digitales. `delay` en segundos, relativo a "ahora".
   */
  playTone({ freq, duration = 0.15, type = 'sine', gain = 0.15, delay = 0 }) {
    const ctx = this.ensureContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      const start = ctx.currentTime + delay;

      osc.type = type;
      osc.frequency.setValueAtTime(freq, start);

      gainNode.gain.setValueAtTime(0, start);
      gainNode.gain.linearRampToValueAtTime(gain, start + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, start + duration);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(start);
      osc.stop(start + duration + 0.03);
    } catch (e) {
      // el audio nunca debe romper el juego
    }
  }

  /** Acierto: arpegio ascendente corto (Do-Mi-Sol), calido y breve. */
  playCorrect() {
    this.playTone({ freq: 523.25, duration: 0.12, type: 'sine', gain: 0.14 });
    this.playTone({ freq: 659.25, duration: 0.14, type: 'sine', gain: 0.14, delay: 0.08 });
    this.playTone({ freq: 783.99, duration: 0.18, type: 'sine', gain: 0.16, delay: 0.16 });
  }

  /** Fallo: tono descendente suave — nunca un "buzzer" agresivo (animo, no regaño). */
  playIncorrect() {
    this.playTone({ freq: 311.13, duration: 0.16, type: 'sine', gain: 0.12 });
    this.playTone({ freq: 233.08, duration: 0.24, type: 'sine', gain: 0.1, delay: 0.1 });
  }

  /** Revelación de botella: mini fanfarria de 4 notas + brillo agudo final — el "premio". */
  playBottleReveal() {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, i) => {
      this.playTone({ freq, duration: 0.2, type: 'triangle', gain: 0.15, delay: i * 0.09 });
    });
    this.playTone({ freq: 1567.98, duration: 0.4, type: 'sine', gain: 0.12, delay: 0.34 });
  }
}

export const audioEngine = new AudioEngine();
