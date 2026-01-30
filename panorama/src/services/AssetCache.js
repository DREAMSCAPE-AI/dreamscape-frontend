/**
 * AssetCache - Service de cache local pour les assets VR
 *
 * Ticket: DR-253 - Cache local des assets VR
 * Basé sur: Gestion des blob URLs du PoC
 *
 * Fonctionnalités:
 * - Cache en mémoire pour les assets récemment utilisés
 * - Gestion automatique des blob URLs
 * - Nettoyage automatique pour éviter les fuites mémoire
 * - Stratégie LRU (Least Recently Used) pour éviction
 */

class AssetCache {
  constructor(options = {}) {
    this.maxItems = options.maxItems || 50; // Nombre max d'assets en cache
    this.maxMemoryMB = options.maxMemoryMB || 500; // Mémoire max en MB
    this.cache = new Map(); // URL -> CacheEntry
    this.accessOrder = []; // Pour LRU
    this.currentMemoryMB = 0;

    console.log('📦 AssetCache initialisé');
    console.log(`  Max items: ${this.maxItems}`);
    console.log(`  Max memory: ${this.maxMemoryMB}MB`);
  }

  /**
   * Ajoute un asset au cache
   * @param {string} originalUrl - URL originale de l'asset
   * @param {Blob|string} asset - Asset à cacher (Blob ou URL optimisée)
   * @param {Object} metadata - Métadonnées (dimensions, size, etc.)
   * @returns {string} URL de l'asset caché
   */
  set(originalUrl, asset, metadata = {}) {
    console.log('📥 Ajout au cache:', originalUrl);

    // Si c'est un Blob, créer une URL
    let cachedUrl = asset;
    let isBlob = false;

    if (asset instanceof Blob) {
      cachedUrl = URL.createObjectURL(asset);
      isBlob = true;
      console.log('  Blob URL créée:', cachedUrl);
    }

    // Calculer la taille
    const sizeMB = this._calculateSize(asset, metadata);

    // Créer l'entrée de cache
    const entry = {
      originalUrl,
      cachedUrl,
      asset,
      isBlob,
      sizeMB,
      metadata,
      createdAt: Date.now(),
      lastAccessedAt: Date.now(),
      accessCount: 0
    };

    // Vérifier si besoin d'éviction
    this._ensureSpace(sizeMB);

    // Ajouter au cache
    this.cache.set(originalUrl, entry);
    this._updateAccessOrder(originalUrl);
    this.currentMemoryMB += sizeMB;

    console.log(`✅ Asset caché (${sizeMB.toFixed(1)}MB)`);
    console.log(`📊 Cache: ${this.cache.size} items, ${this.currentMemoryMB.toFixed(1)}MB`);

    return cachedUrl;
  }

  /**
   * Récupère un asset du cache
   * @param {string} originalUrl - URL originale
   * @returns {Object|null} Entry du cache ou null
   */
  get(originalUrl) {
    const entry = this.cache.get(originalUrl);

    if (!entry) {
      console.log('❌ Cache miss:', originalUrl);
      return null;
    }

    // Mettre à jour les statistiques d'accès
    entry.lastAccessedAt = Date.now();
    entry.accessCount++;
    this._updateAccessOrder(originalUrl);

    console.log(`✅ Cache hit: ${originalUrl} (accès #${entry.accessCount})`);

    return entry;
  }

  /**
   * Vérifie si un asset est en cache
   * @param {string} originalUrl
   * @returns {boolean}
   */
  has(originalUrl) {
    return this.cache.has(originalUrl);
  }

  /**
   * Supprime un asset du cache
   * @param {string} originalUrl
   */
  delete(originalUrl) {
    const entry = this.cache.get(originalUrl);

    if (!entry) return;

    console.log('🗑️ Suppression du cache:', originalUrl);

    // Nettoyer les blob URLs
    if (entry.isBlob && entry.cachedUrl) {
      URL.revokeObjectURL(entry.cachedUrl);
      console.log('  Blob URL révoquée:', entry.cachedUrl);
    }

    this.currentMemoryMB -= entry.sizeMB;
    this.cache.delete(originalUrl);
    this._removeFromAccessOrder(originalUrl);

    console.log(`✅ Supprimé (${entry.sizeMB.toFixed(1)}MB libérés)`);
  }

  /**
   * Vide complètement le cache
   */
  clear() {
    console.log(`🧹 Nettoyage complet du cache (${this.cache.size} items)...`);

    // Nettoyer tous les blob URLs
    this.cache.forEach((entry, url) => {
      if (entry.isBlob && entry.cachedUrl) {
        URL.revokeObjectURL(entry.cachedUrl);
      }
    });

    const memoryFreed = this.currentMemoryMB;

    this.cache.clear();
    this.accessOrder = [];
    this.currentMemoryMB = 0;

    console.log(`✅ Cache vidé (${memoryFreed.toFixed(1)}MB libérés)`);
  }

  /**
   * Assure qu'il y a assez d'espace dans le cache
   * @private
   */
  _ensureSpace(requiredMB) {
    // Vérifier la limite de mémoire
    while (this.currentMemoryMB + requiredMB > this.maxMemoryMB && this.cache.size > 0) {
      const lruUrl = this.accessOrder[0]; // Least recently used
      console.log(`⚠️ Éviction LRU (mémoire): ${lruUrl}`);
      this.delete(lruUrl);
    }

    // Vérifier la limite d'items
    while (this.cache.size >= this.maxItems) {
      const lruUrl = this.accessOrder[0];
      console.log(`⚠️ Éviction LRU (items): ${lruUrl}`);
      this.delete(lruUrl);
    }
  }

  /**
   * Met à jour l'ordre d'accès (LRU)
   * @private
   */
  _updateAccessOrder(url) {
    // Retirer de l'ancienne position
    this._removeFromAccessOrder(url);

    // Ajouter à la fin (le plus récemment utilisé)
    this.accessOrder.push(url);
  }

  /**
   * Retire une URL de l'ordre d'accès
   * @private
   */
  _removeFromAccessOrder(url) {
    const index = this.accessOrder.indexOf(url);
    if (index !== -1) {
      this.accessOrder.splice(index, 1);
    }
  }

  /**
   * Calcule la taille d'un asset
   * @private
   */
  _calculateSize(asset, metadata) {
    if (asset instanceof Blob) {
      return asset.size / 1024 / 1024; // Bytes to MB
    }

    // Estimation basée sur les métadonnées
    if (metadata.width && metadata.height) {
      // RGBA = 4 bytes par pixel
      return (metadata.width * metadata.height * 4) / 1024 / 1024;
    }

    // Estimation par défaut
    return 10; // 10MB par défaut
  }

  /**
   * Retourne les statistiques du cache
   * @returns {Object}
   */
  getStats() {
    const entries = Array.from(this.cache.values());

    const stats = {
      itemCount: this.cache.size,
      memoryUsedMB: this.currentMemoryMB,
      memoryLimitMB: this.maxMemoryMB,
      memoryUsagePercent: (this.currentMemoryMB / this.maxMemoryMB) * 100,
      itemLimit: this.maxItems,
      itemUsagePercent: (this.cache.size / this.maxItems) * 100,
      oldestEntry: entries.length > 0 ? Math.min(...entries.map(e => e.createdAt)) : null,
      newestEntry: entries.length > 0 ? Math.max(...entries.map(e => e.createdAt)) : null,
      totalAccesses: entries.reduce((sum, e) => sum + e.accessCount, 0),
      avgAccessCount: entries.length > 0 ? entries.reduce((sum, e) => sum + e.accessCount, 0) / entries.length : 0
    };

    return stats;
  }

  /**
   * Affiche les statistiques du cache
   */
  logStats() {
    const stats = this.getStats();

    console.log('📊 === STATISTIQUES DU CACHE ===');
    console.log(`Items: ${stats.itemCount}/${stats.itemLimit} (${stats.itemUsagePercent.toFixed(1)}%)`);
    console.log(`Mémoire: ${stats.memoryUsedMB.toFixed(1)}MB/${stats.memoryLimitMB}MB (${stats.memoryUsagePercent.toFixed(1)}%)`);
    console.log(`Accès total: ${stats.totalAccesses}`);
    console.log(`Accès moyen/item: ${stats.avgAccessCount.toFixed(1)}`);

    if (stats.oldestEntry) {
      const oldestAge = (Date.now() - stats.oldestEntry) / 1000 / 60; // minutes
      console.log(`Entrée la plus ancienne: ${oldestAge.toFixed(1)} minutes`);
    }

    console.log('===============================');
  }

  /**
   * Nettoie les entrées anciennes (non accédées depuis X minutes)
   * @param {number} maxAgeMinutes - Âge maximum en minutes
   */
  pruneOld(maxAgeMinutes = 30) {
    const now = Date.now();
    const maxAgeMs = maxAgeMinutes * 60 * 1000;
    let prunedCount = 0;

    this.cache.forEach((entry, url) => {
      const age = now - entry.lastAccessedAt;
      if (age > maxAgeMs) {
        console.log(`🧹 Pruning old entry (${(age / 60000).toFixed(1)} min): ${url}`);
        this.delete(url);
        prunedCount++;
      }
    });

    if (prunedCount > 0) {
      console.log(`✅ Nettoyé ${prunedCount} entrées anciennes`);
    }
  }
}

// Singleton
let cacheInstance = null;

export const getAssetCache = (options) => {
  if (!cacheInstance) {
    cacheInstance = new AssetCache(options);
  }
  return cacheInstance;
};

export default AssetCache;
