import { describe, it, expect } from 'vitest';
import { events, getEventsByLocation } from './events';
import { getArtistById } from './artists';
import { getLocationNameById, getLocations } from './locations';

describe('Event functions', () => {
  it('should return events for a location that exists in the data', () => {
    // Arrange - Prendre un lieu au hasard qui a des événements
    const locations = getLocations();
    let testLocation = null;
    let locationEvents = [];
    
    // Trouver un lieu qui a des événements associés
    for (const location of locations) {
      const eventsForLocation = events.filter(e => e.locationId === location.id);
      if (eventsForLocation.length > 0) {
        testLocation = location;
        locationEvents = eventsForLocation;
        break;
      }
    }
    
    // S'assurer qu'on a trouvé un lieu avec des événements
    expect(testLocation).not.toBeNull();
    
    // Act
    const result = getEventsByLocation(testLocation.name);
    
    // Assert
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    
    // Vérifier que tous les événements retournés ont le bon lieu
    result.forEach(event => {
      const eventLocationName = getLocationNameById(event.locationId);
      expect(eventLocationName).toBe(testLocation.name);
    });
  });
  
  it('should return an empty array for non-existent location', () => {
    // Arrange
    const nonExistentLocation = 'Location-Qui-Nexiste-Pas-' + Date.now();
    
    // Act
    const result = getEventsByLocation(nonExistentLocation);
    
    // Assert
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(0);
  });
  
  it('should have valid artist data for each event', () => {
    // Act & Assert
    events.forEach(event => {
      const artist = getArtistById(event.artistId);
      
      // Vérifier que l'artiste existe
      expect(artist).toBeDefined();
      
      // Vérifier que les propriétés de l'artiste correspondent à l'événement
      if (artist) {
        expect(event.artistName).toBe(artist.name);
        expect(event.type).toBe(artist.type);
      }
    });
  });
  
  it('should have valid location data for each event', () => {
    // Arrange
    const locations = getLocations();
    const locationIds = locations.map(loc => loc.id);
    
    // Act & Assert
    events.forEach(event => {
      // Vérifier que l'ID du lieu est défini
      expect(event.locationId).toBeDefined();
      expect(typeof event.locationId).toBe('string');
      
      // Vérifier que l'ID du lieu existe dans la liste des lieux
      expect(locationIds).toContain(event.locationId);
      
      // Vérifier que le nom du lieu peut être récupéré à partir de l'ID
      const locationName = getLocationNameById(event.locationId);
      expect(locationName).not.toBe('');
      
      // Vérifier que le nom du lieu correspond à celui de l'événement
      expect(event.locationName).toBe(locationName);
    });
  });
  
  it('should have all required properties for each event', () => {
    events.forEach(event => {
      // Propriétés de base
      expect(event.id).toBeDefined();
      expect(typeof event.id).toBe('string');
      expect(event.title).toBeDefined();
      expect(typeof event.title).toBe('string');
      expect(event.time).toBeDefined();
      expect(typeof event.time).toBe('string');
      expect(event.days).toBeDefined();
      expect(Array.isArray(event.days)).toBe(true);
      
      // Propriétés liées à l'artiste
      expect(event.artistId).toBeDefined();
      expect(typeof event.artistId).toBe('string');
      expect(event.artistName).toBeDefined();
      expect(typeof event.artistName).toBe('string');
      expect(event.type).toBeDefined();
      expect(['exposition', 'concert'].includes(event.type)).toBe(true);
    });
  });
});

