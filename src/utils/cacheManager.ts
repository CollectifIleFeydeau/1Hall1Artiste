/**
 * Gestionnaire de cache pour stocker les données fréquemment utilisées
 * Cela permet d'améliorer les performances et de réduire les recherches répétitives
 */

type CacheItem<T> = {
  data: T;
  timestamp: number;
  expiry: number | null; // null = pas d'expiration
};

class CacheManager {
  private cache: Map<string, CacheItem<any>> = new Map();
  private defaultExpiry: number = 30 * 60 * 1000; // 30 minutes par défaut

  /**
   * Définit une valeur dans le cache
   * @param key - Clé unique pour identifier les données
   * @param data - Données à mettre en cache
   * @param expiry - Durée de validité en millisecondes (null = pas d'expiration)
   */
  set<T>(key: string, data: T, expiry: number | null = this.defaultExpiry): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiry
    });
  }

  /**
   * Récupère des données du cache
   * @param key - Clé des données à récupérer
   * @returns Les données si elles existent et sont valides, sinon null
   */
  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) return null;
    
    // Vérifier si les données ont expiré
    if (item.expiry !== null) {
      const now = Date.now();
      if (now - item.timestamp > item.expiry) {
        this.cache.delete(key);
        return null;
      }
    }
    
    return item.data as T;
  }

  /**
   * Récupère des données du cache ou les génère si elles n'existent pas
   * @param key - Clé des données
   * @param generator - Fonction qui génère les données si elles ne sont pas en cache
   * @param expiry - Durée de validité en millisecondes
   * @returns Les données du cache ou nouvellement générées
   */
  async getOrSet<T>(
    key: string, 
    generator: () => Promise<T>, 
    expiry: number | null = this.defaultExpiry
  ): Promise<T> {
    const cachedData = this.get<T>(key);
    
    if (cachedData !== null) {
      return cachedData;
    }
    
    const freshData = await generator();
    this.set(key, freshData, expiry);
    return freshData;
  }

  /**
   * Supprime des données du cache
   * @param key - Clé des données à supprimer
   */
  remove(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Vérifie si une clé existe dans le cache et est valide
   * @param key - Clé à vérifier
   * @returns true si la clé existe et est valide, sinon false
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Vide le cache entièrement
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Nettoie les entrées expirées du cache
   */
  cleanup(): void {
    const now = Date.now();
    
    for (const [key, item] of this.cache.entries()) {
      if (item.expiry !== null && now - item.timestamp > item.expiry) {
        this.cache.delete(key);
      }
    }
  }
}

// Exporter une instance unique du gestionnaire de cache
export const cacheManager = new CacheManager();

