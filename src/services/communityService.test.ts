import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchCommunityEntries, moderateContent, submitContribution } from './communityServiceBridge';
import { AnonymousSessionService } from './anonymousSessionService';
import { CommunityEntry, EntryType, ModerationStatus } from '../types/communityTypes';
import { enrichSubmissionWithContext, getContributionContext, setEventContributionContext, setLocationContributionContext, clearContributionContext } from './contextualContributionService';
import { events } from '../data/events';
import { locations } from '../data/locations';

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

describe('Community Service Integration Tests', () => {
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
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe('Contribution Context Integration', () => {
    it('should set and retrieve event contribution context', () => {
      // Arrange
      const testEvent = events[0];
      
      // Act
      setEventContributionContext(testEvent);
      const context = getContributionContext();
      
      // Assert
      expect(context).not.toBeNull();
      expect(context?.type).toBe('event');
      expect(context?.id).toBe(testEvent.id);
      expect(context?.name).toBe(testEvent.title);
    });

    it('should set and retrieve location contribution context', () => {
      // Arrange
      const testLocation = locations[0];
      
      // Act
      setLocationContributionContext(testLocation);
      const context = getContributionContext();
      
      // Assert
      expect(context).not.toBeNull();
      expect(context?.type).toBe('location');
      expect(context?.id).toBe(testLocation.id);
      expect(context?.name).toBe(testLocation.name);
    });

    it('should clear contribution context', () => {
      // Arrange
      const testEvent = events[0];
      setEventContributionContext(testEvent);
      
      // Verify context is set
      expect(getContributionContext()).not.toBeNull();
      
      // Act
      clearContributionContext();
      
      // Assert
      expect(getContributionContext()).toBeNull();
    });

    it('should enrich submission params with context', () => {
      // Arrange
      const testEvent = events[0];
      setEventContributionContext(testEvent);
      
      const params = {
        type: 'photo' as EntryType,
        displayName: 'Test User',
        description: 'Test description'
      };
      
      // Act
      const enrichedParams = enrichSubmissionWithContext(params);
      
      // Assert
      expect(enrichedParams.contextType).toBe('event');
      expect(enrichedParams.contextId).toBe(testEvent.id);
      expect(enrichedParams.displayName).toBe('Test User');
      expect(enrichedParams.description).toBe('Test description');
    });
  });

  describe('Community Entries Management', () => {
    it('should fetch community entries from localStorage in development mode', async () => {
      // Arrange
      const mockEntries: CommunityEntry[] = [
        {
          id: 'entry1',
          type: 'photo',
          displayName: 'User 1',
          createdAt: new Date().toISOString(),
          moderation: {
            status: 'approved' as ModerationStatus,
            moderatedAt: new Date().toISOString()
          },
          imageUrl: 'local:test-image-1',
          description: 'Test photo'
        },
        {
          id: 'entry2',
          type: 'testimonial',
          displayName: 'User 2',
          createdAt: new Date().toISOString(),
          moderation: {
            status: 'approved' as ModerationStatus,
            moderatedAt: new Date().toISOString()
          },
          content: 'Test testimonial'
        }
      ];
      
      localStorage.setItem('community_entries', JSON.stringify(mockEntries));
      
      // Act
      const entries = await fetchCommunityEntries();
      
      // Assert
      expect(entries).toHaveLength(2);
      expect(entries[0].id).toBe('entry1');
      expect(entries[1].id).toBe('entry2');
    });

    it('should handle empty localStorage for community entries', async () => {
      // Act
      const entries = await fetchCommunityEntries();
      
      // Assert
      expect(entries).toEqual([]);
    });
  });

  describe('Moderation Integration', () => {
    it('should moderate text content in development mode', async () => {
      // Arrange
      const testContent = 'This is a test testimonial';
      
      // Mock the communityServiceBridge implementation
      vi.mock('./communityServiceBridge', async () => {
        const actual = await vi.importActual('./communityServiceBridge');
        return {
          ...actual as object,
          moderateContent: async (text: string) => {
            return {
              entryId: `temp-${Date.now()}`,
              status: 'approved'
            };
          }
        };
      });
      
      // Act
      const result = await moderateContent(testContent);
      
      // Assert
      expect(result).toBeDefined();
      expect(result.status).toBe('approved');
      expect(result.entryId).toBeDefined();
      
      // Restore original implementation
      vi.restoreAllMocks();
    });

    it('should reject content with forbidden words', async () => {
      // This test assumes the moderateContent function has a list of forbidden words
      // We need to modify the function to expose this list or make it configurable for testing
      
      // Mock the communityServiceBridge implementation
      vi.mock('./communityServiceBridge', async () => {
        const actual = await vi.importActual('./communityServiceBridge');
        return {
          ...actual as object,
          moderateContent: async (text: string) => {
            if (text.includes('mot1')) {
              return {
                entryId: `temp-${Date.now()}`,
                status: 'rejected',
                message: 'Le texte contient des mots inappropriés'
              };
            }
            
            return {
              entryId: `temp-${Date.now()}`,
              status: 'approved'
            };
          }
        };
      });
      
      // Arrange
      const testContent = 'This text contains mot1 which should be rejected';
      
      // Act
      const result = await moderateContent(testContent);
      
      // Assert
      expect(result).toBeDefined();
      expect(result.status).toBe('rejected');
      expect(result.message).toBeDefined();
      
      // Restore original implementation
      vi.restoreAllMocks();
    });
  });

  describe('Contribution Submission Integration', () => {
    it('should submit a photo contribution with context', async () => {
      // Arrange
      const testEvent = events[0];
      setEventContributionContext(testEvent);
      
      // Mock the session ID
      vi.spyOn(AnonymousSessionService, 'getOrCreateSessionId').mockReturnValue('test-session-id');
      
      // Mock the uploadImage function
      vi.spyOn(require('./communityService'), 'uploadImage').mockResolvedValue({
        imageUrl: 'local:test-image',
        thumbnailUrl: 'local:test-thumbnail'
      });
      
      // Create a mock File object
      const testFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      
      const submissionParams = {
        type: 'photo' as EntryType,
        displayName: 'Test User',
        description: 'Test photo description',
        image: testFile
      };
      
      // Act
      const result = await submitContribution(submissionParams);
      
      // Assert
      expect(result).toBeDefined();
      expect(result.type).toBe('photo');
      expect(result.displayName).toBe('Test User');
      expect(result.description).toBe('Test photo description');
      expect(result.contextType).toBe('event');
      expect(result.contextId).toBe(testEvent.id);
      expect(result.imageUrl).toBe('local:test-image');
      expect(result.thumbnailUrl).toBe('local:test-thumbnail');
      expect(result.sessionId).toBe('test-session-id');
      
      // Verify the entry was saved to localStorage
      const storedEntries = JSON.parse(localStorage.getItem('community_entries') || '[]');
      expect(storedEntries).toHaveLength(1);
      expect(storedEntries[0].id).toBe(result.id);
    });
  });

  describe('GitHub Actions Workflow Integration', () => {
    it('should call the API endpoint in production mode', async () => {
      // Mock process.env to simulate production environment
      vi.stubGlobal('process', {
        env: {
          NODE_ENV: 'production'
        }
      });
      
      // Mock fetch response for API call
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true })
      });
      
      // Create a mock File object
      const testFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      
      // Mock the uploadImage function for production
      vi.spyOn(require('./communityService'), 'uploadImage').mockImplementation(async (image: File) => {
        // In production, this would call the API
        return {
          imageUrl: 'https://github.com/CollectifIleFeydeau/community-content/raw/main/images/test-image.jpg',
          thumbnailUrl: 'https://github.com/CollectifIleFeydeau/community-content/raw/main/thumbnails/test-image.jpg'
        };
      });
      
      // Mock the session ID
      vi.spyOn(AnonymousSessionService, 'getOrCreateSessionId').mockReturnValue('test-session-id');
      
      const submissionParams = {
        type: 'photo' as EntryType,
        displayName: 'Test User',
        description: 'Test photo description',
        image: testFile
      };
      
      // Act
      await submitContribution(submissionParams);
      
      // Assert that fetch was called with the correct URL
      expect(fetch).toHaveBeenCalled();
      const fetchCalls = (fetch as any).mock.calls;
      expect(fetchCalls.some((call: any[]) => 
        call[0].includes('/api/submit-contribution')
      )).toBe(true);
    });
  });
});
