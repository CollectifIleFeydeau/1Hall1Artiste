import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { submitContribution } from '../services/communityServiceBridge';
import { setEventContributionContext, setLocationContributionContext } from '../services/contextualContributionService';
import { AnonymousSessionService } from '../services/anonymousSessionService';
import { EntryType } from '../types/communityTypes';
import { events } from '../data/events';
import { locations } from '../data/locations';
import { trackEvent } from '../services/analytics';

// Mock des modules
vi.mock('../services/analytics', () => ({
  trackEvent: vi.fn()
}));

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value.toString(); },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
    getAllKeys: () => Object.keys(store)
  };
})();

// Mock fetch
global.fetch = vi.fn();

describe('Community Gallery Workflow Integration Tests', () => {
  beforeEach(() => {
    // Setup localStorage mock
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
    localStorage.clear();
    
    // Reset fetch mock
    vi.resetAllMocks();
    
    // Mock process.env
    vi.stubGlobal('process', {
      env: {
        NODE_ENV: 'development'
      }
    });
    
    // Mock the uploadImage function
    vi.spyOn(require('../services/communityService'), 'uploadImage').mockResolvedValue({
      imageUrl: 'local:test-image',
      thumbnailUrl: 'local:test-thumbnail'
    });
    
    // Mock the session ID
    vi.spyOn(AnonymousSessionService, 'getOrCreateSessionId').mockReturnValue('test-session-id');
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe('Event Contribution Workflow', () => {
    it('should track analytics when contributing from an event', async () => {
      // Arrange
      const testEvent = events[0];
      setEventContributionContext(testEvent);
      
      // Create a mock File object
      const testFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      
      const submissionParams = {
        type: 'photo' as EntryType,
        displayName: 'Test User',
        description: 'Test photo from event',
        image: testFile
      };
      
      // Act
      const result = await submitContribution(submissionParams);
      
      // Assert
      expect(result).toBeDefined();
      expect(result.contextType).toBe('event');
      expect(result.contextId).toBe(testEvent.id);
      
      // Verify analytics tracking
      expect(trackEvent).toHaveBeenCalledWith({
        category: 'Community',
        action: 'submit_contribution',
        label: 'photo'
      });
    });
  });

  describe('Location Contribution Workflow', () => {
    it('should track analytics when contributing from a location', async () => {
      // Arrange
      const testLocation = locations[0];
      setLocationContributionContext(testLocation);
      
      // Create a mock File object
      const testFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      
      const submissionParams = {
        type: 'photo' as EntryType,
        displayName: 'Test User',
        description: 'Test photo from location',
        image: testFile
      };
      
      // Act
      const result = await submitContribution(submissionParams);
      
      // Assert
      expect(result).toBeDefined();
      expect(result.contextType).toBe('location');
      expect(result.contextId).toBe(testLocation.id);
      
      // Verify analytics tracking
      expect(trackEvent).toHaveBeenCalledWith({
        category: 'Community',
        action: 'submit_contribution',
        label: 'photo'
      });
    });
  });

  describe('GitHub Actions Workflow Simulation', () => {
    it('should simulate the GitHub Actions workflow for contribution processing', async () => {
      // Mock process.env to simulate production environment
      vi.stubGlobal('process', {
        env: {
          NODE_ENV: 'production'
        }
      });
      
      // Mock fetch responses for the API calls in the workflow
      global.fetch = vi.fn()
        // First call: submit contribution
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ 
            id: 'new-entry-123',
            status: 'pending'
          })
        })
        // Second call: check moderation status
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            status: 'approved'
          })
        })
        // Third call: get updated entries
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            entries: [
              {
                id: 'new-entry-123',
                type: 'photo',
                displayName: 'Test User',
                createdAt: new Date().toISOString(),
                likes: 0,
                moderation: {
                  status: 'approved',
                  moderatedAt: new Date().toISOString()
                },
                imageUrl: 'https://github.com/CollectifIleFeydeau/community-content/raw/main/images/test-image.jpg',
                thumbnailUrl: 'https://github.com/CollectifIleFeydeau/community-content/raw/main/thumbnails/test-image.jpg',
                description: 'Test photo from event',
                contextType: 'event',
                contextId: events[0].id
              }
            ],
            lastUpdated: new Date().toISOString()
          })
        });
      
      // Create a mock File object
      const testFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      
      // Set event context
      setEventContributionContext(events[0]);
      
      const submissionParams = {
        type: 'photo' as EntryType,
        displayName: 'Test User',
        description: 'Test photo from event',
        image: testFile
      };
      
      // Act: Submit contribution
      const result = await submitContribution(submissionParams);
      
      // Assert: Verify API calls
      expect(fetch).toHaveBeenCalledTimes(1);
      
      // Verify the first API call was to submit-contribution
      const firstCall = (fetch as any).mock.calls[0];
      expect(firstCall[0]).toContain('/api/submit-contribution');
      
      // Verify the result
      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.moderation.status).toBe('pending');
    });
  });

  describe('Image Persistence Test', () => {
    it('should verify image URLs are correctly formatted for GitHub storage', async () => {
      // Mock process.env to simulate production environment
      vi.stubGlobal('process', {
        env: {
          NODE_ENV: 'production'
        }
      });
      
      // Mock the uploadImage function for production
      vi.spyOn(require('../services/communityService'), 'uploadImage').mockImplementation(async (image: File) => {
        // In production, this would upload to GitHub and return URLs
        const imageId = `test-${Date.now()}`;
        return {
          imageUrl: `https://github.com/CollectifIleFeydeau/community-content/raw/main/images/${imageId}.jpg`,
          thumbnailUrl: `https://github.com/CollectifIleFeydeau/community-content/raw/main/thumbnails/${imageId}.jpg`
        };
      });
      
      // Mock fetch response
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ 
          id: 'new-entry-123',
          status: 'pending',
          imageUrl: `https://github.com/CollectifIleFeydeau/community-content/raw/main/images/test-${Date.now()}.jpg`,
          thumbnailUrl: `https://github.com/CollectifIleFeydeau/community-content/raw/main/thumbnails/test-${Date.now()}.jpg`
        })
      });
      
      // Create a mock File object
      const testFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      
      const submissionParams = {
        type: 'photo' as EntryType,
        displayName: 'Test User',
        description: 'Test photo',
        image: testFile
      };
      
      // Act
      const result = await submitContribution(submissionParams);
      
      // Assert
      expect(result).toBeDefined();
      expect(result.imageUrl).toContain('https://github.com/CollectifIleFeydeau/community-content/raw/main/images/');
      expect(result.thumbnailUrl).toContain('https://github.com/CollectifIleFeydeau/community-content/raw/main/thumbnails/');
    });
  });
});
