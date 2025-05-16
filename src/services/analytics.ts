import ReactGA from 'react-ga4';

// Google Analytics measurement ID
const MEASUREMENT_ID = 'G-1KF31VN3RM';

// Initialize GA
export const initGA = () => {
  ReactGA.initialize(MEASUREMENT_ID);
};

// Track page views
export const trackPageView = (path: string) => {
  ReactGA.send({ hitType: "pageview", page: path });
};

// Track events
export const trackEvent = (category: string, action: string, label?: string, value?: number) => {
  ReactGA.event({
    category,
    action,
    label,
    value
  });
};

// Track user interactions with specific features
export const trackFeatureUsage = {
  mapLocation: (locationId: string) => {
    trackEvent('Map', 'View Location', locationId);
  },
  eventView: (eventId: string, eventTitle: string) => {
    trackEvent('Program', 'View Event', eventTitle, 1);
  },
  donationClick: () => {
    trackEvent('Donation', 'Click Donate Button');
  },
  shareContent: (platform: string, contentType: string) => {
    trackEvent('Share', 'Share Content', `${contentType} via ${platform}`);
  }
};
