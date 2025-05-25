import { describe, it, expect } from 'vitest';
import { getLocationNameById, getLocations } from './locations';
import { events } from './events';

describe('Location functions', () => {
  it('should return a location name for a valid ID', () => {
    // Arrange
    const locations = getLocations();
    // Prendre un lieu au hasard pour le test
    const randomLocation = locations[Math.floor(Math.random() * locations.length)];
    
    // Act
    const result = getLocationNameById(randomLocation.id);
    
    // Assert
    expect(result).toBe(randomLocation.name);
  });
  
  it('should return an empty string for invalid location ID', () => {
    // Arrange
    const invalidLocationId = 'non-existent-location';
    
    // Act
    const result = getLocationNameById(invalidLocationId);
    
    // Assert
    expect(result).toBe('');
  });
  
  it('should return all locations with required properties', () => {
    // Act
    const locations = getLocations();
    
    // Assert
    expect(locations).toBeDefined();
    expect(locations.length).toBeGreaterThan(0);
    
    // Check that each location has the required properties
    locations.forEach(location => {
      expect(location.id).toBeDefined();
      expect(typeof location.id).toBe('string');
      expect(location.name).toBeDefined();
      expect(typeof location.name).toBe('string');
      expect(location.x).toBeDefined();
      expect(typeof location.x).toBe('number');
      expect(location.y).toBeDefined();
      expect(typeof location.y).toBe('number');
      
      // Ensure the location doesn't have the old 'events' property
      expect(location).not.toHaveProperty('events');
    });
  });
  
  it('should have a valid locationId for each event', () => {
    // Arrange
    const locations = getLocations();
    const locationIds = locations.map(loc => loc.id);
    
    // Act & Assert
    events.forEach(event => {
      expect(event.locationId).toBeDefined();
      expect(typeof event.locationId).toBe('string');
      expect(locationIds).toContain(event.locationId);
      
      // Vérifier que le nom du lieu peut être récupéré à partir de l'ID
      const locationName = getLocationNameById(event.locationId);
      expect(locationName).not.toBe('');
    });
  });
});
