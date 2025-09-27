import { createLogger } from './logger';

const logger = createLogger('StorageManager');

// Types pour les métadonnées de cache
interface CacheMetadata {
  timestamp: number;
  version: string;
  size: number;
}

interface CacheItem<T> {
  data: T;
  metadata: CacheMetadata;
}

// Version actuelle de l'application (à mettre à jour lors des déploiements)
const APP_VERSION = '1.0.0';

// Durée de vie par défaut des éléments en cache (en millisecondes)
const DEFAULT_TTL = 24 * 60 * 60 * 1000; // 24 heures

// Taille maximale du stockage (en octets, 5MB par défaut)
const MAX_STORAGE_SIZE = 5 * 1024 * 1024;

// Préfixe pour les clés de stockage
const STORAGE_PREFIX = 'collectif-feydeau:';

/**
 * Gestionnaire de stockage amélioré avec gestion de cache et de quota
 */
export class StorageManager {
  private storage: Storage;
  private prefix: string;
  private version: string;
  private totalSize: number = 0;
  
  constructor(storage: Storage = localStorage, prefix: string = STORAGE_PREFIX, version: string = APP_VERSION) {
    this.storage = storage;
    this.prefix = prefix;
    this.version = version;
    this.calculateTotalSize();
  }
  
  /**
   * Calcule la taille totale utilisée dans le stockage
   */
  private calculateTotalSize(): void {
    let size = 0;
    for (let i = 0; i < this.storage.length; i++) {
      const key = this.storage.key(i);
      if (key && key.startsWith(this.prefix)) {
        try {
          const value = this.storage.getItem(key);
          if (value) {
            size += value.length * 2; // Approximation: 2 octets par caractère
          }
        } catch (error) {
          logger.error('Erreur lors du calcul de la taille du stockage', error);
        }
      }
    }
    this.totalSize = size;
    logger.info(`Taille totale du stockage: ${this.formatSize(size)}`);
  }
  
  /**
   * Formate la taille en unités lisibles (KB, MB)
   */
  private formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }
  
  /**
   * Génère une clé préfixée
   */
  private getKey(key: string): string {
    return `${this.prefix}${key}`;
  }
  
  /**
   * Enregistre des données dans le stockage avec métadonnées
   */
  set<T>(key: string, data: T, ttl: number = DEFAULT_TTL): boolean {
    try {
      const fullKey = this.getKey(key);
      const serializedData = JSON.stringify(data);
      const size = serializedData.length * 2; // Approximation: 2 octets par caractère
      
      const item: CacheItem<T> = {
        data,
        metadata: {
          timestamp: Date.now(),
          version: this.version,
          size
        }
      };
      
      const serializedItem = JSON.stringify(item);
      
      // Vérifier si nous avons assez d'espace
      if (this.totalSize + serializedItem.length * 2 > MAX_STORAGE_SIZE) {
        // Pas assez d'espace, essayer de libérer
        logger.warn('Stockage presque plein, nettoyage des éléments expirés');
        this.cleanup();
        
        // Vérifier à nouveau
        if (this.totalSize + serializedItem.length * 2 > MAX_STORAGE_SIZE) {
          logger.error('Stockage plein, impossible d\'enregistrer les données');
          return false;
        }
      }
      
      this.storage.setItem(fullKey, serializedItem);
      this.totalSize += serializedItem.length * 2;
      
      logger.info(`Données enregistrées pour la clé ${key}`, { size: this.formatSize(size) });
      return true;
    } catch (error) {
      logger.error(`Erreur lors de l'enregistrement des données pour la clé ${key}`, error);
      return false;
    }
  }
  
  /**
   * Récupère des données du stockage avec vérification de validité
   */
  get<T>(key: string, defaultValue: T | null = null): T | null {
    try {
      const fullKey = this.getKey(key);
      const serializedItem = this.storage.getItem(fullKey);
      
      if (!serializedItem) {
        return defaultValue;
      }
      
      const item: CacheItem<T> = JSON.parse(serializedItem);
      
      // Vérifier si les données sont expirées
      const now = Date.now();
      const expiryTime = item.metadata.timestamp + DEFAULT_TTL;
      
      if (now > expiryTime) {
        logger.info(`Données expirées pour la clé ${key}`);
        this.remove(key);
        return defaultValue;
      }
      
      // Vérifier si les données sont d'une version antérieure
      if (item.metadata.version !== this.version) {
        logger.info(`Données d'une version antérieure pour la clé ${key}`);
        this.remove(key);
        return defaultValue;
      }
      
      logger.info(`Données récupérées pour la clé ${key}`);
      return item.data;
    } catch (error) {
      logger.error(`Erreur lors de la récupération des données pour la clé ${key}`, error);
      return defaultValue;
    }
  }
  
  /**
   * Supprime des données du stockage
   */
  remove(key: string): boolean {
    try {
      const fullKey = this.getKey(key);
      
      // Récupérer la taille avant suppression
      const serializedItem = this.storage.getItem(fullKey);
      if (serializedItem) {
        const size = serializedItem.length * 2;
        this.totalSize -= size;
      }
      
      this.storage.removeItem(fullKey);
      logger.info(`Données supprimées pour la clé ${key}`);
      return true;
    } catch (error) {
      logger.error(`Erreur lors de la suppression des données pour la clé ${key}`, error);
      return false;
    }
  }
  
  /**
   * Nettoie les éléments expirés du stockage
   */
  cleanup(): void {
    try {
      const now = Date.now();
      const keysToRemove: string[] = [];
      
      // Identifier les clés à supprimer
      for (let i = 0; i < this.storage.length; i++) {
        const key = this.storage.key(i);
        if (key && key.startsWith(this.prefix)) {
          try {
            const serializedItem = this.storage.getItem(key);
            if (serializedItem) {
              const item = JSON.parse(serializedItem);
              const expiryTime = item.metadata.timestamp + DEFAULT_TTL;
              
              if (now > expiryTime || item.metadata.version !== this.version) {
                keysToRemove.push(key);
              }
            }
          } catch (error) {
            logger.error(`Erreur lors de l'analyse de l'élément ${key}`, error);
          }
        }
      }
      
      // Supprimer les éléments expirés
      keysToRemove.forEach(key => {
        try {
          const serializedItem = this.storage.getItem(key);
          if (serializedItem) {
            const size = serializedItem.length * 2;
            this.totalSize -= size;
          }
          
          this.storage.removeItem(key);
        } catch (error) {
          logger.error(`Erreur lors de la suppression de l'élément ${key}`, error);
        }
      });
      
      logger.info(`Nettoyage terminé, ${keysToRemove.length} éléments supprimés`);
      logger.info(`Nouvelle taille du stockage: ${this.formatSize(this.totalSize)}`);
    } catch (error) {
      logger.error('Erreur lors du nettoyage du stockage', error);
    }
  }
  
  /**
   * Vide complètement le stockage (uniquement les éléments avec le préfixe)
   */
  clear(): void {
    try {
      const keysToRemove: string[] = [];
      
      for (let i = 0; i < this.storage.length; i++) {
        const key = this.storage.key(i);
        if (key && key.startsWith(this.prefix)) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => {
        this.storage.removeItem(key);
      });
      
      this.totalSize = 0;
      logger.info(`Stockage vidé, ${keysToRemove.length} éléments supprimés`);
    } catch (error) {
      logger.error('Erreur lors du vidage du stockage', error);
    }
  }
}

// Exporter une instance par défaut pour une utilisation facile
export const storageManager = new StorageManager();

