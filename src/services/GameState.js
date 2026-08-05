import { SKINS_CATALOG } from '../data/skinsData.js';
import { BOTTLES_CATALOG } from '../data/cavaData.js';
import { REGIONS_DATA } from '../data/regionsData.js';

const STORAGE_KEY = 'vinotipos_game_state_v2';

export class GameState {
  constructor() {
    this.listeners = [];
    this.state = this.loadState();
  }

  getDefaultState() {
    return {
      xp: 120,
      gems: 250,
      streak: 3,
      accuracy: 94,
      currentRegionId: 'champagne',
      currentSkinId: 'skin_default',
      purchasedSkinIds: ['skin_default'],
      unlockedBottleIds: ['b1_champagne', 'b2_chianti'],
      unlockedRegionIds: ['champagne', 'toscana', 'rioja'],
      completedLessons: ['champagne_1', 'champagne_2'],
      consecutiveErrors: 0
    };
  }

  loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return this.getDefaultState();
      const parsed = JSON.parse(raw);
      
      // Validación básica de esquema para prevenir fallos o ataques de inyección
      return {
        xp: typeof parsed.xp === 'number' ? parsed.xp : 120,
        gems: typeof parsed.gems === 'number' ? parsed.gems : 250,
        streak: typeof parsed.streak === 'number' ? parsed.streak : 3,
        accuracy: typeof parsed.accuracy === 'number' ? parsed.accuracy : 94,
        currentRegionId: parsed.currentRegionId || 'champagne',
        currentSkinId: parsed.currentSkinId || 'skin_default',
        purchasedSkinIds: Array.isArray(parsed.purchasedSkinIds) ? parsed.purchasedSkinIds : ['skin_default'],
        unlockedBottleIds: Array.isArray(parsed.unlockedBottleIds) ? parsed.unlockedBottleIds : ['b1_champagne', 'b2_chianti'],
        unlockedRegionIds: Array.isArray(parsed.unlockedRegionIds) ? parsed.unlockedRegionIds : ['champagne', 'toscana', 'rioja'],
        completedLessons: Array.isArray(parsed.completedLessons) ? parsed.completedLessons : ['champagne_1'],
        consecutiveErrors: typeof parsed.consecutiveErrors === 'number' ? parsed.consecutiveErrors : 0
      };
    } catch (e) {
      console.warn('Estado guardado corrupto. Restaurando valores por defecto.', e);
      return this.getDefaultState();
    }
  }

  saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
      this.notifyListeners();
    } catch (e) {
      console.error('Error al guardar el estado en LocalStorage', e);
    }
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

  // Métodos de juego
  addXP(amount) {
    const skin = this.getEquippedSkin();
    let bonus = 1;
    if (skin.id === 'skin_sommelier') bonus = 1.2; // +20% XP Buff
    
    this.state.xp += Math.round(amount * bonus);
    this.checkRegionUnlocks();
    this.checkBottleUnlocks();
    this.saveState();
  }

  addGems(amount) {
    const skin = this.getEquippedSkin();
    let bonus = 1;
    if (skin.id === 'skin_magnate' && this.state.accuracy === 100) bonus = 2; // Multiplicador x2

    this.state.gems += Math.round(amount * bonus);
    this.saveState();
  }

  recordError() {
    this.state.consecutiveErrors += 1;
    this.saveState();
    return this.state.consecutiveErrors;
  }

  resetErrors() {
    this.state.consecutiveErrors = 0;
    this.saveState();
  }

  setCurrentRegion(id) {
    this.state.currentRegionId = id;
    this.saveState();
  }

  equipSkin(skinId) {
    if (this.state.purchasedSkinIds.includes(skinId)) {
      this.state.currentSkinId = skinId;
      this.saveState();
      return true;
    }
    return false;
  }

  buySkin(skinId, price) {
    if (this.state.gems >= price && !this.state.purchasedSkinIds.includes(skinId)) {
      this.state.gems -= price;
      this.state.purchasedSkinIds.push(skinId);
      this.state.currentSkinId = skinId;
      this.saveState();
      return true;
    }
    return false;
  }

  getEquippedSkin() {
    return SKINS_CATALOG.find(s => s.id === this.state.currentSkinId) || SKINS_CATALOG[0];
  }

  checkRegionUnlocks() {
    REGIONS_DATA.forEach(region => {
      if (region.reqXP && this.state.xp >= region.reqXP && !this.state.unlockedRegionIds.includes(region.id)) {
        this.state.unlockedRegionIds.push(region.id);
      }
    });
  }

  checkBottleUnlocks() {
    BOTTLES_CATALOG.forEach(bottle => {
      if (bottle.reqXP && this.state.xp >= bottle.reqXP && !this.state.unlockedBottleIds.includes(bottle.id)) {
        this.state.unlockedBottleIds.push(bottle.id);
      }
    });
  }
}

export const gameState = new GameState();
