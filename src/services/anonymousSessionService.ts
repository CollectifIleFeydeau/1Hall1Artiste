/**
 * Service de gestion des sessions anonymes pour la galerie communautaire
 */
export class AnonymousSessionService {
  private static SESSION_ID_KEY = 'community_session_id';
  private static DISPLAY_NAME_KEY = 'community_display_name';
  
  /**
   * Récupère l'ID de session existant ou en crée un nouveau
   */
  static getOrCreateSessionId(): string {
    const existingId = localStorage.getItem(this.SESSION_ID_KEY);
    
    if (existingId) {
      return existingId;
    }
    
    const newId = this.generateUniqueId();
    localStorage.setItem(this.SESSION_ID_KEY, newId);
    return newId;
  }
  
  /**
   * Définit le nom d'affichage de l'utilisateur
   */
  static setDisplayName(name: string): void {
    localStorage.setItem(this.DISPLAY_NAME_KEY, name);
  }
  
  /**
   * Récupère le nom d'affichage de l'utilisateur
   */
  static getDisplayName(): string | null {
    return localStorage.getItem(this.DISPLAY_NAME_KEY);
  }
  
  /**
   * Vérifie si l'utilisateur a déjà contribué
   */
  static hasContributed(): boolean {
    return localStorage.getItem('community_has_contributed') === 'true';
  }
  
  /**
   * Marque l'utilisateur comme ayant contribué
   */
  static markAsContributed(): void {
    localStorage.setItem('community_has_contributed', 'true');
  }
  
  /**
   * Génère un identifiant unique basé sur l'horodatage et un nombre aléatoire
   */
  private static generateUniqueId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }
}

