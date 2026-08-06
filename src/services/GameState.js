import { SKINS_CATALOG } from '../data/skinsData.js';
import { BOTTLES_CATALOG } from '../data/cavaData.js';
import { REGIONS_DATA } from '../data/regionsData.js';
import { VINOTIPOS_CATALOG } from '../data/vinotiposData.js';
import { supabase, ensureAnonymousSession } from './supabaseClient.js';

const MAX_LIVES = 5;
const AGE_GATE_KEY = 'vinotipos_age_verified_v1';

// Reglas de progreso real (Fase 2, prompt 2) — no decorativas, se verifican
// contra el historial de Supabase.
const MASTERY_THRESHOLD = 0.8; // 80% de aciertos minimo
const MIN_QUESTIONS_FOR_MASTERY = 5; // muestra minima antes de considerar "dominada" una region
const REVIEW_DUE_DAYS = 7; // repeticion espaciada: reaparece 1+ semana despues del ultimo acierto
const STREAK_FREEZE_COST = 50; // costo en Gemas de "Congelar Racha"
const LIVES_REFRESH_COST = 20; // costo en Gemas de refrescar las 5 copas antes del reinicio diario

const XP_BY_LEVEL = { 1: 10, 2: 15, 3: 25 };
const GEMS_BY_LEVEL = { 1: 2, 2: 3, 3: 5 };

// Traduce las claves de this.state (camelCase) a columnas de la tabla
// public.player_progress (snake_case) para los métodos que persisten un patch parcial.
const STATE_TO_COLUMN = {
  xp: 'xp',
  gems: 'gems',
  streak: 'streak',
  accuracy: 'accuracy',
  lives: 'lives',
  currentRegionId: 'current_region_id',
  currentSkinId: 'current_skin_id',
  consecutiveErrors: 'consecutive_errors',
  ageVerified: 'age_verified',
  lastActivityDate: 'last_activity_date',
  streakFreezes: 'streak_freezes',
  challengesToday: 'challenges_today',
  vinotipoType: 'vinotipo_type'
};

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function daysBetween(isoDateA, isoDateB) {
  const [ay, am, ad] = isoDateA.split('-').map(Number);
  const [by, bm, bd] = isoDateB.split('-').map(Number);
  const a = Date.UTC(ay, am - 1, ad);
  const b = Date.UTC(by, bm - 1, bd);
  return Math.round((b - a) / 86400000);
}

/**
 * GameState — Fase 2: el progreso del jugador vive en Supabase (tablas
 * player_progress / player_unlocks / region_answer_history), no en LocalStorage.
 * La interfaz pública original (state, subscribe, addXP, addGems, ...) se
 * mantiene igual para no romper a HeaderProgress/WorldMap/CavaModal.
 *
 * Prompt 2 agrega la mecánica real de juego: respuestas reales
 * (recordAnswer), cierre de sesión con racha/vidas (completeChallengeSession),
 * el gate de 80% de aciertos para desbloquear regiones, repetición espaciada
 * y un pequeño event bus (on/emit) para que la UI reaccione a desbloqueos
 * con animaciones (GSAP) sin acoplar GameState a la capa visual.
 */
export class GameState {
  constructor() {
    this.listeners = [];
    this.eventListeners = {};
    this.userId = null;
    this.ready = false;
    this._freshDayCheckedDate = null;
    this.state = this.getDefaultState();
    this.initPromise = this.init();
  }

  getDefaultState() {
    return {
      xp: 0,
      gems: 0,
      streak: 0,
      accuracy: 0,
      lives: MAX_LIVES,
      currentRegionId: 'champagne',
      currentSkinId: 'skin_default',
      purchasedSkinIds: ['skin_default'],
      unlockedBottleIds: [],
      unlockedRegionIds: [],
      completedLessons: [],
      consecutiveErrors: 0,
      ageVerified: false,
      lastActivityDate: null,
      streakFreezes: 0,
      challengesToday: 0,
      vinotipoType: null
    };
  }

  async init() {
    try {
      const session = await ensureAnonymousSession();
      this.userId = session.user.id;
      await this.loadState();
      this.ensureFreshDay();
    } catch (e) {
      console.error('No se pudo cargar el progreso desde Supabase. Se usa un estado local temporal.', e);
    } finally {
      this.ready = true;
      this.notifyListeners();
    }
  }

  async loadState() {
    const { data: progress, error: progressError } = await supabase
      .from('player_progress')
      .select('*')
      .eq('user_id', this.userId)
      .maybeSingle();

    if (progressError) throw progressError;

    // El trigger on_auth_user_created crea la fila al registrarse el usuario.
    // Si por algun motivo no existe todavia, la creamos aqui de forma defensiva.
    const row = progress || await this.createDefaultProgressRow();

    const { data: unlocks, error: unlocksError } = await supabase
      .from('player_unlocks')
      .select('unlock_type, item_id')
      .eq('user_id', this.userId);

    if (unlocksError) throw unlocksError;

    const byType = (type) => (unlocks || [])
      .filter(u => u.unlock_type === type)
      .map(u => u.item_id);

    const purchasedSkinIds = byType('skin');

    this.state = {
      xp: row.xp,
      gems: row.gems,
      streak: row.streak,
      accuracy: Number(row.accuracy),
      lives: row.lives,
      currentRegionId: row.current_region_id,
      currentSkinId: row.current_skin_id,
      purchasedSkinIds: purchasedSkinIds.length ? purchasedSkinIds : ['skin_default'],
      unlockedBottleIds: byType('bottle'),
      unlockedRegionIds: byType('region'),
      completedLessons: byType('lesson'),
      consecutiveErrors: row.consecutive_errors,
      ageVerified: row.age_verified,
      lastActivityDate: row.last_activity_date,
      streakFreezes: row.streak_freezes,
      challengesToday: row.challenges_today,
      vinotipoType: row.vinotipo_type
    };
  }

  async createDefaultProgressRow() {
    const { data, error } = await supabase
      .from('player_progress')
      .insert({ user_id: this.userId })
      .select('*')
      .single();
    if (error) throw error;
    return data;
  }

  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  notifyListeners() {
    this.listeners.forEach(cb => cb(this.state));
  }

  // ==========================================================================
  // Event bus liviano — para que la UI dispare animaciones (GSAP) al
  // desbloquear una region/botella sin que GameState conozca la capa visual.
  // ==========================================================================
  on(eventName, callback) {
    if (!this.eventListeners[eventName]) this.eventListeners[eventName] = new Set();
    this.eventListeners[eventName].add(callback);
    return () => this.eventListeners[eventName]?.delete(callback);
  }

  emit(eventName, payload) {
    (this.eventListeners[eventName] || new Set()).forEach(cb => {
      try {
        cb(payload);
      } catch (e) {
        console.error(`Error en listener de "${eventName}":`, e);
      }
    });
  }

  /**
   * Aplica un patch al estado en memoria (respuesta instantánea para la UI) y
   * lo sincroniza contra player_progress en segundo plano.
   */
  applyAndPersist(patch) {
    Object.assign(this.state, patch);
    this.notifyListeners();
    this.persistProgress(patch);
  }

  async persistProgress(patch) {
    if (!this.userId) return;
    const columnPatch = {};
    for (const key of Object.keys(patch)) {
      const column = STATE_TO_COLUMN[key];
      if (column) columnPatch[column] = patch[key];
    }
    if (Object.keys(columnPatch).length === 0) return;
    if (patch.ageVerified) columnPatch.age_verified_at = new Date().toISOString();
    if (patch.vinotipoType) columnPatch.vinotipo_revealed_at = new Date().toISOString();

    const { error } = await supabase
      .from('player_progress')
      .update(columnPatch)
      .eq('user_id', this.userId);

    if (error) console.error('Error al guardar progreso en Supabase:', error);
  }

  async persistUnlock(unlockType, itemId) {
    if (!this.userId) return;
    const { error } = await supabase
      .from('player_unlocks')
      .insert({ user_id: this.userId, unlock_type: unlockType, item_id: itemId });

    // 23505 = unique_violation (el desbloqueo ya existia) — no es un error real.
    if (error && error.code !== '23505') {
      console.error('Error al guardar desbloqueo en Supabase:', error);
    }
  }

  // ==========================================================================
  // Métodos de juego "base" (misma interfaz publica que en prompt 1)
  // ==========================================================================
  // Fase 2 (prompt 3): el buff de skin_sommelier deja de ser cosmético — este
  // multiplicador es el que realmente se aplica y persiste en Supabase.
  // Expuesto como método público para que CourseEngine muestre el XP EXACTO
  // que se va a guardar (no un numero base que despues no coincide).
  getXpBonusMultiplier() {
    const skin = this.getEquippedSkin();
    return skin.id === 'skin_sommelier' ? 1.2 : 1;
  }

  // Igual que arriba, pero para el buff x2 Gemas de skin_magnate.
  getGemsBonusMultiplier() {
    const skin = this.getEquippedSkin();
    return (skin.id === 'skin_magnate' && this.state.accuracy === 100) ? 2 : 1;
  }

  addXP(amount) {
    this.applyAndPersist({ xp: this.state.xp + Math.round(amount * this.getXpBonusMultiplier()) });
    this.checkBottleUnlocks();
  }

  addGems(amount) {
    this.applyAndPersist({ gems: this.state.gems + Math.round(amount * this.getGemsBonusMultiplier()) });
  }

  // Fase 2: cada fallo real resta una copa de vida (sistema de "5 copas").
  recordError() {
    const consecutiveErrors = this.state.consecutiveErrors + 1;
    const lives = Math.max(0, this.state.lives - 1);
    this.applyAndPersist({ consecutiveErrors, lives });
    return consecutiveErrors;
  }

  resetErrors() {
    this.applyAndPersist({ consecutiveErrors: 0 });
  }

  // Restaura las 5 copas de vida. Se usa automaticamente al empezar un dia
  // nuevo (ver ensureFreshDay) y queda disponible para futuros refills.
  restoreLives() {
    this.applyAndPersist({ lives: MAX_LIVES });
  }

  // Sistema Visual v2 — pantalla "Sin Vidas": refresco real pagando Gemas
  // (mismo patron que buyStreakFreeze). No hace nada si ya hay vidas de sobra
  // o si no alcanzan las Gemas; en ambos casos devuelve false sin cobrar.
  refreshLivesWithGems(cost = LIVES_REFRESH_COST) {
    if (this.state.lives >= MAX_LIVES) return false;
    if (this.state.gems < cost) return false;

    this.applyAndPersist({
      gems: this.state.gems - cost,
      lives: MAX_LIVES
    });
    return true;
  }

  setCurrentRegion(id) {
    this.applyAndPersist({ currentRegionId: id });
  }

  equipSkin(skinId) {
    if (this.state.purchasedSkinIds.includes(skinId)) {
      this.applyAndPersist({ currentSkinId: skinId });
      return true;
    }
    return false;
  }

  buySkin(skinId, price) {
    if (this.state.gems >= price && !this.state.purchasedSkinIds.includes(skinId)) {
      this.state.purchasedSkinIds.push(skinId);
      this.applyAndPersist({ gems: this.state.gems - price, currentSkinId: skinId });
      this.persistUnlock('skin', skinId);
      return true;
    }
    return false;
  }

  getEquippedSkin() {
    return SKINS_CATALOG.find(s => s.id === this.state.currentSkinId) || SKINS_CATALOG[0];
  }

  // Los bonos por XP siguen siendo el unico gate de las botellas (no requieren
  // precision) — a diferencia de las regiones, que si la exigen (ver mas abajo).
  checkBottleUnlocks() {
    BOTTLES_CATALOG.forEach(bottle => {
      if (bottle.reqXP && this.state.xp >= bottle.reqXP && !this.state.unlockedBottleIds.includes(bottle.id)) {
        this.state.unlockedBottleIds.push(bottle.id);
        this.persistUnlock('bottle', bottle.id);
        this.notifyListeners();
        this.emit('bottle:unlocked', bottle);
      }
    });
  }

  // ==========================================================================
  // Mecánica real de juego (Fase 2 — prompt 2)
  // ==========================================================================

  /**
   * Lee TODO el historial de respuestas del jugador de una sola vez y lo
   * agrega en memoria: aciertos/total por region (gate de 80% + repetición
   * espaciada), aciertos/total por nivel de dificultad y "recuperaciones"
   * (acierto justo despues de 2+ fallos seguidos) — estas dos ultimas
   * alimentan el cálculo real del Vinotipo (ver computeVinotipo).
   */
  async computeProgressStats() {
    const empty = {
      byRegion: new Map(),
      byLevel: new Map(),
      overallCorrect: 0,
      overallTotal: 0,
      lastCorrectAtByRegion: new Map(),
      recoveryCount: 0
    };
    if (!this.userId) return empty;

    const { data, error } = await supabase
      .from('region_answer_history')
      .select('region_id, difficulty_level, is_correct, answered_at')
      .eq('user_id', this.userId)
      .order('answered_at', { ascending: true });

    if (error) {
      console.error('Error al leer el historial de respuestas:', error);
      return empty;
    }

    const rows = data || [];
    const byRegion = new Map();
    const byLevel = new Map();
    const lastCorrectAtByRegion = new Map();
    let overallCorrect = 0;
    let recoveryCount = 0;
    let consecutiveFails = 0;

    rows.forEach(row => {
      const regionStat = byRegion.get(row.region_id) || { correct: 0, total: 0 };
      regionStat.total += 1;

      const levelStat = byLevel.get(row.difficulty_level) || { correct: 0, total: 0 };
      levelStat.total += 1;

      if (row.is_correct) {
        regionStat.correct += 1;
        levelStat.correct += 1;
        overallCorrect += 1;

        // Acierto que llega justo despues de una racha de 2+ fallos: "recuperacion".
        if (consecutiveFails >= 2) recoveryCount += 1;
        consecutiveFails = 0;

        const prevLast = lastCorrectAtByRegion.get(row.region_id);
        if (!prevLast || new Date(row.answered_at) > new Date(prevLast)) {
          lastCorrectAtByRegion.set(row.region_id, row.answered_at);
        }
      } else {
        consecutiveFails += 1;
      }

      byRegion.set(row.region_id, regionStat);
      byLevel.set(row.difficulty_level, levelStat);
    });

    return { byRegion, byLevel, overallCorrect, overallTotal: rows.length, lastCorrectAtByRegion, recoveryCount };
  }

  isRegionMastered(stats, regionId) {
    const stat = stats.byRegion.get(regionId);
    return !!stat && stat.total >= MIN_QUESTIONS_FOR_MASTERY && (stat.correct / stat.total) >= MASTERY_THRESHOLD;
  }

  /**
   * Persiste una respuesta real (acierto o fallo) contra region_answer_history
   * y actualiza XP/Gemas/vidas/racha-de-errores en consecuencia. Es el unico
   * punto de entrada que CourseEngine usa para registrar una respuesta.
   */
  async recordAnswer({ regionId, level, isCorrect }) {
    if (this.userId) {
      const { error } = await supabase.from('region_answer_history').insert({
        user_id: this.userId,
        region_id: regionId,
        difficulty_level: level,
        is_correct: isCorrect
      });
      if (error) console.error('Error al guardar respuesta en el historial:', error);
    }

    if (isCorrect) {
      this.resetErrors();
      this.addXP(XP_BY_LEVEL[level] || 10);
      this.addGems(GEMS_BY_LEVEL[level] || 2);
    } else {
      this.recordError();
    }

    return { lives: this.state.lives, consecutiveErrors: this.state.consecutiveErrors };
  }

  /**
   * Exige minimo 80% de aciertos (con muestra minima) en CADA region ya
   * desbloqueada antes de abrir la siguiente por XP — verificado contra el
   * historial real de Supabase, no es un simple chequeo de XP.
   */
  async checkRegionUnlocks(statsParam) {
    const stats = statsParam || await this.computeProgressStats();

    const allUnlockedMastered = this.state.unlockedRegionIds.every(id => this.isRegionMastered(stats, id));
    if (!allUnlockedMastered) return [];

    const newlyUnlocked = [];
    REGIONS_DATA.forEach(region => {
      if (region.reqXP && this.state.xp >= region.reqXP && !this.state.unlockedRegionIds.includes(region.id)) {
        this.state.unlockedRegionIds.push(region.id);
        this.persistUnlock('region', region.id);
        newlyUnlocked.push(region);
      }
    });

    if (newlyUnlocked.length) {
      this.notifyListeners();
      newlyUnlocked.forEach(region => this.emit('region:unlocked', region));
    }

    return newlyUnlocked;
  }

  /**
   * Repetición espaciada: entre las regiones ya dominadas, busca una cuyo
   * ultimo acierto tenga 7+ dias de antiguedad para reinyectarla mezclada en
   * la proxima sesion de reto.
   */
  async getDueReviewRegion(statsParam) {
    const stats = statsParam || await this.computeProgressStats();
    const masteredIds = this.state.unlockedRegionIds.filter(id => this.isRegionMastered(stats, id));

    const now = Date.now();
    const dueIds = masteredIds.filter(id => {
      const lastCorrect = stats.lastCorrectAtByRegion.get(id);
      if (!lastCorrect) return false;
      const daysSince = (now - new Date(lastCorrect).getTime()) / 86400000;
      return daysSince >= REVIEW_DUE_DAYS;
    });

    if (!dueIds.length) return null;
    const chosenId = dueIds[Math.floor(Math.random() * dueIds.length)];
    return REGIONS_DATA.find(r => r.id === chosenId) || null;
  }

  async isCourseComplete(statsParam) {
    const stats = statsParam || await this.computeProgressStats();
    return REGIONS_DATA.every(region =>
      this.state.unlockedRegionIds.includes(region.id) && this.isRegionMastered(stats, region.id)
    );
  }

  // ==========================================================================
  // "Vinotipo" — puente de marca hacia el libro "Dime tu Carácter" (Fase 2, prompt 3)
  // ==========================================================================

  /**
   * Calcula el Vinotipo a partir del patrón REAL de respuestas (no es
   * aleatorio): cuatro señales simples, cada una asociada a un arquetipo.
   * Gana el arquetipo con el puntaje más alto. Es una lectura narrativa, no
   * un test psicométrico — así lo aclara el propio catálogo.
   */
  computeVinotipo(stats) {
    const totalCorrect = Math.max(1, stats.overallCorrect);
    const totalRegions = Math.max(1, REGIONS_DATA.length);

    const level3 = stats.byLevel.get(3) || { correct: 0, total: 0 };

    const scores = {
      // Guardián: domina la producción libre (sin imagen, la más exigente).
      guardian: level3.correct / totalCorrect,
      // Nómada: reparte sus aciertos entre muchas regiones distintas.
      nomada: stats.byRegion.size / totalRegions,
      // Anfitrión: eficiencia global — pocas veces falla.
      anfitrion: stats.overallTotal > 0 ? stats.overallCorrect / stats.overallTotal : 0,
      // Alquimista: sus aciertos suelen llegar justo despues de tropezar.
      alquimista: stats.recoveryCount / totalCorrect
    };

    const winnerId = Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
    return VINOTIPOS_CATALOG[winnerId];
  }

  /**
   * Se llama al terminar una sesión donde el curso quedó completo. Si el
   * Vinotipo ya fue revelado antes, no vuelve a calcular ni a disparar el
   * momento de suspenso — solo se revela (y se persiste) una vez por jugador.
   */
  async revealVinotipoIfNeeded(statsParam) {
    if (this.state.vinotipoType) return null;

    const stats = statsParam || await this.computeProgressStats();
    const complete = await this.isCourseComplete(stats);
    if (!complete) return null;

    const vinotipo = this.computeVinotipo(stats);
    this.applyAndPersist({ vinotipoType: vinotipo.id });
    return vinotipo;
  }

  /**
   * Se llama una sola vez al terminar una sesion de reto (no por pregunta).
   * Recalcula precision global real, evalua desbloqueos de region y aplica
   * la logica de racha/vidas del dia.
   */
  async completeChallengeSession() {
    const stats = await this.computeProgressStats();

    const accuracy = stats.overallTotal > 0
      ? Math.round((stats.overallCorrect / stats.overallTotal) * 10000) / 100
      : 0;

    const dayResult = this.registerDailyActivity();
    const newlyUnlockedRegions = await this.checkRegionUnlocks(stats);
    const courseComplete = await this.isCourseComplete(stats);

    this.applyAndPersist({ accuracy });

    return { ...dayResult, newlyUnlockedRegions, courseComplete };
  }

  // ==========================================================================
  // Racha con pérdida real + "Congelar Racha"
  // ==========================================================================

  /**
   * Al tocar el juego por primera vez en un dia nuevo, refresca las vidas y el
   * contador de retos del dia. NO toca la racha (eso solo ocurre al completar
   * un reto de verdad, en registerDailyActivity) — asi un dia nuevo siempre
   * empieza con vidas llenas aunque el jugador aun no haya jugado hoy.
   */
  ensureFreshDay() {
    const today = todayStr();
    if (this._freshDayCheckedDate === today) return;
    this._freshDayCheckedDate = today;

    const isNewDay = this.state.lastActivityDate && this.state.lastActivityDate !== today;
    const needsRefill = this.state.lives < MAX_LIVES || this.state.challengesToday > 0;

    if (isNewDay && needsRefill) {
      this.applyAndPersist({ lives: MAX_LIVES, challengesToday: 0 });
    }
  }

  /**
   * Racha real: se extiende si el jugador completo un reto ayer, se cubre con
   * un "Congelar Racha" si salteó exactamente un dia, o se reinicia a 1 si
   * saltó mas dias y no tiene congelaciones disponibles.
   */
  registerDailyActivity() {
    const today = todayStr();
    const last = this.state.lastActivityDate;
    const isNewDay = last !== today;

    const patch = {
      challengesToday: isNewDay ? 1 : (this.state.challengesToday || 0) + 1
    };

    let streakChanged = 'same';

    if (isNewDay) {
      patch.lastActivityDate = today;

      if (!last) {
        patch.streak = 1;
        streakChanged = 'started';
      } else {
        const gap = daysBetween(last, today);
        if (gap === 1) {
          patch.streak = this.state.streak + 1;
          streakChanged = 'extended';
        } else if (gap === 2 && this.state.streakFreezes > 0) {
          patch.streak = this.state.streak + 1;
          patch.streakFreezes = this.state.streakFreezes - 1;
          streakChanged = 'frozen';
        } else {
          patch.streak = 1;
          streakChanged = 'reset';
        }
      }
    }

    this.applyAndPersist(patch);

    return { streak: this.state.streak, streakChanged, challengesToday: this.state.challengesToday };
  }

  // true si el jugador tiene racha activa pero todavia no jugó hoy: si el dia
  // termina sin completar un reto, mañana la racha se pierde (o se congela).
  isStreakAtRisk() {
    return this.state.streak > 0 && this.state.lastActivityDate !== todayStr();
  }

  buyStreakFreeze(cost = STREAK_FREEZE_COST) {
    if (this.state.gems >= cost) {
      this.applyAndPersist({
        gems: this.state.gems - cost,
        streakFreezes: (this.state.streakFreezes || 0) + 1
      });
      return true;
    }
    return false;
  }

  // ==========================================================================
  // Verificación de edad (Fase 2 — obligatoria)
  // ==========================================================================

  /**
   * Chequeo sincrónico usado en el arranque de la app para decidir si mostrar
   * la pantalla de verificación de edad. Vive en LocalStorage (no en Supabase)
   * a propósito: debe responder antes de que termine el login anónimo y debe
   * seguir funcionando sin conexión (la app es una PWA offline-first).
   */
  hasConfirmedAge() {
    try {
      return localStorage.getItem(AGE_GATE_KEY) === 'adult';
    } catch (e) {
      return false;
    }
  }

  /**
   * Guarda la respuesta de la verificación de edad. Se confirma de inmediato
   * en LocalStorage (fuente de verdad para no volver a preguntar en este
   * dispositivo) y se espeja en Supabase para conservar el dato si en el
   * futuro el usuario vincula una cuenta permanente.
   */
  async confirmAgeVerification(isAdult) {
    try {
      localStorage.setItem(AGE_GATE_KEY, isAdult ? 'adult' : 'minor');
    } catch (e) {
      console.warn('No se pudo guardar la verificación de edad en LocalStorage.', e);
    }

    if (!isAdult) return;

    // Espera a que termine la carga inicial para no pisar el patch con el
    // estado que venga de Supabase justo despues.
    await this.initPromise;
    this.applyAndPersist({ ageVerified: true });
  }
}

export const gameState = new GameState();
