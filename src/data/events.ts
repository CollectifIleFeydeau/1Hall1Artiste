import { getArtistById, Artist } from './artists';
import { getLocationNameById } from './locations';

// Type for event-specific details, linking to an artist via artistId
export type EventDetails = {
  id: string; // Unique ID for this specific event instance
  artistId: string; // Foreign key to artists.ts
  title: string; // Event's own title
  // description: string; // Event's own description
  time: string;
  days: ("samedi" | "dimanche")[];
  locationId: string; // Référence à l'ID du lieu dans locations.ts
};

// Combined Event type that components will use
// It mirrors the structure of the old Event type for compatibility
export type Event = {
  // Fields from EventDetails
  id: string;
  artistId: string;
  title: string; // Event's title
  // description: string; // Event's description
  time: string;
  days: ("samedi" | "dimanche")[];
  locationId: string;
  locationName: string;

  // Fields from Artist (kept for compatibility)
  artistName: Artist['name'];
  type: Artist['type']; // 'exposition' or 'concert'
  image?: Artist['image'];
};

// Raw schedule data: list of event-specific details
const eventScheduleData: EventDetails[] = [
  // Concerts
  {
    id: "clarine",
    artistId: "clarine",
    title: "Clarine Julienne",
    // description: "Choeur de femmes Nota Bene en concert",
    time: "14h00 - 14h30",
    days: ["samedi"],
    locationId: "quai-turenne-9-concert",
  },
  {
    id: "concert-nota-bene",
    artistId: "nota-bene",
    title: "Choeur de femmes Nota Bene",
    // description: "Choeur de femmes Nota Bene en concert",
    time: "14h45 - 15h15",
    days: ["samedi"],
    locationId: "quai-turenne-9-concert",
  },
  {
    id: "Omega",
    artistId: "Semaphore Omega",
    title: "Semaphore Omega (lectures poétiques en musique)",
    time: "15h30 - 16h00",
    days: ["samedi"],
    locationId: "quai-turenne-9-concert",
  },
  {
    id: "concert-conteurs-samedi",
    artistId: "philippe-peaud",
    title: "Conteurs",
    // description: "Séance de contes avec Philippe Peaud",
    time: "16h00 - 16h45",
    days: ["samedi"],
    locationId: "quai-turenne-9-concert",
  },
  {
    id: "concert-conteurs-dimanche",
    artistId: "philippe-peaud", // Same artist, different event
    title: "Conteurs",
    // description: "Séance de contes avec Philippe Peaud",
    time: "16h00 - 16h45",
    days: ["dimanche"],
    locationId: "quai-turenne-9-concert",
  },
  {
    id: "concert-violoncelles",
    artistId: "violoncelles", // Same artist, different event
    title: "Ensemble de violoncelles du conservatoire",
    time: "17h00 - 17h30",
    days: ["samedi"],
    locationId: "quai-turenne-9-concert",
  },
  {
    id: "scarabees",
    artistId: "scarabees", // Matched with artists.ts id
    title: "Les Scarabées Rôdent",
    time: "17h45 - 18h15",
    days: ["samedi"],
    locationId: "quai-turenne-9-concert",
  },
  {
    id: "aperto",
    artistId: "aperto", // Matched with artists.ts id
    title: "Aperto !",
    time: "18h30 - 19h00",
    days: ["samedi"],
    locationId: "quai-turenne-9-concert",
  },
  {
    id: "concert-quatuor-liger",
    artistId: "quatuor-liger", // Matched with artists.ts id
    title: "Quatuor Liger",
    time: "14h00 - 14h30",
    days: ["dimanche"],
    locationId: "quai-turenne-9-concert",
  },
  {
    id: "concert-eva",
    artistId: "eva", // Matched with artists.ts id
    title: "L'Ensemble Vocal EVA",
    time: "14h45 - 15h15",
    days: ["dimanche"],
    locationId: "quai-turenne-9-concert",
  },
  {
    id: "Omega",
    artistId: "Semaphore Omega",
    title: "Semaphore Omega (lectures poétiques en musique)",
    time: "15h30 - 16h00",
    days: ["dimanche"],
    locationId: "quai-turenne-9-concert",
  },
  {
    id: "concert-swing-it",
    artistId: "swing-it", // Matched with artists.ts id
    title: "Swing it !",
    time: "17h00 - 17h30",
    days: ["dimanche"],
    locationId: "quai-turenne-9-concert",
  },
  {
    id: "concert-variabilis",
    artistId: "variabilis", // Matched with artists.ts id
    title: "Variabilis",
    time: "17h45 - 18h15",
    days: ["dimanche"],
    locationId: "quai-turenne-9-concert",
  },


  // Expositions
  {
    id: "expo-emmanuelle-boisson", // Changed ID to be more descriptive
    artistId: "emmanuelle-boisson",
    title: "Illustrations et Carnets", // This is the exhibition title
    time: "12h00 - 19h00, samedi et dimanche",
    days: ["samedi", "dimanche"],
    locationId: "quai-turenne-8",

  },
  {
    id: "expo-catherine-clement", // Changed ID
    artistId: "catherine-clement",
    title: "Peintures en Miniature",
    time: "12h00 - 19h00, samedi et dimanche",
    days: ["samedi", "dimanche"],
    locationId: "quai-turenne-8",

  },
  {
    id: "expo-mostapha-rouine", // Changed ID
    artistId: "mostapha-rouine",
    title: "Entre Bretagne et Maroc",
    time: "12h00 - 19h00, samedi et dimanche",
    days: ["samedi", "dimanche"],
    locationId: "quai-turenne-8",

  },

  {
    id: "expo-bruno-barbier", 
    artistId: "bruno-barbier",
    title: "Peintures et dessins",
    time: "12h00 - 19h00",
    days: ["samedi", "dimanche"],
    locationId: "quai-turenne-9",

  },
  // {
  //   id: "expo-pauline-crusson", // Changed ID (was pauline-crusson)
  //   artistId: "pauline-crusson",
  //   title: "Cartes postales du vieux Nantes",
  //   time: "12h00 - 19h00",
  //   days: ["samedi", "dimanche"],
  //   locationId: "rue-duguesclin",

  // },
  {
    id: "expo-alain-gremillet",
    artistId: "alain-gremillet",
    title: "Peinture abstraite",
    time: "12h00 - 19h00, samedi et dimanche",
    days: ["samedi", "dimanche"],
    locationId: "quai-turenne-10",

  },
  {
    id: "expo-jerome-gourdon",
    artistId: "jerome-gourdon",
    title: "Photo-émographie",
    time: "12h00 - 19h00, samedi et dimanche",
    days: ["samedi", "dimanche"],
    locationId: "quai-turenne-10",

  },
  {
    id: "expo-nadege-hameau",
    artistId: "nadege-hameau",
    title: "Marqueur acrylique",
    time: "12h00 - 19h00, samedi et dimanche",
    days: ["samedi", "dimanche"],
    locationId: "quai-turenne-10",

  },
  {
    id: "expo-pauline-crusson-2",
    artistId: "pauline-crusson",
    title: "PaoaNaoned",
    time: "12h00 - 19h00, samedi et dimanche",
    days: ["samedi", "dimanche"],
    locationId: "allee-duguay-trouin-11",

  },
  {
    id: "expo-marie-husson",
    artistId: "marie-husson",
    title: "Dessins et peintures",
    time: "12h00 - 19h00, samedi et dimanche",
    days: ["samedi", "dimanche"],
    locationId: "rue-kervegan-17",

  },
  {
    id: "expo-clotilde-debar-zablocki",
    artistId: "clotilde-debar-zablocki",
    title: "apolline.design",
    time: "12h00 - 19h00, samedi et dimanche",
    days: ["samedi", "dimanche"],
    locationId: "allee-duguay-trouin-15",

  },
  {
    id: "expo-gael-caudoux",
    artistId: "gael-caudoux",
    title: "Cartographies imaginaires",
    time: "12h00 - 19h00, samedi et dimanche",
    days: ["samedi", "dimanche"],
    locationId: "allee-duguay-trouin-11",

  },
  {
    id: "expo-andry-shango-rajoelina",
    artistId: "andry-shango-rajoelina",
    title: "Illustration pop culture",
    time: "12h00 - 19h00, samedi et dimanche",
    days: ["samedi", "dimanche"],
    locationId: "allee-duguay-trouin-16",

  },
  {
    id: "expo-jerome-luneau",
    artistId: "jerome-luneau",
    title: "Chun Yong Ho",
    time: "12h00 - 19h00, samedi et dimanche",
    days: ["samedi", "dimanche"],
    locationId: "allee-duguay-trouin-16",

  },
  {
    id: "expo-jocelyn-prouff", // Changed ID (was expo9)
    artistId: "expo9",
    title: "Carnets Nantais",
    time: "12h00 - 19h00, samedi et dimanche",
    days: ["samedi", "dimanche"],
    locationId: "allee-duguay-trouin-16",

  },
  {
    id: "expo-elizaveta-vodyanova",
    artistId: "elizaveta-vodyanova",
    title: "Peinture",
    time: "12h00 - 19h00, samedi et dimanche",
    days: ["samedi", "dimanche"],
    locationId: "quai-turenne-10",

  },
  {
    id: "expo-fabienne-choyau",
    artistId: "fabienne-choyau",
    title: "Peinture contemporaine",
    time: "12h00 - 19h00, samedi et dimanche",
    days: ["samedi", "dimanche"],
    locationId: "allee-duguay-trouin-15",

  }
];

// Dynamically construct the events array by merging EventDetails with Artist data
export const events: Event[] = eventScheduleData.map(eventDetail => {
  const artist = getArtistById(eventDetail.artistId);

  if (!artist) {
    // This case should ideally not happen if artistId always refers to a valid artist.
    // Handle error: log it, and potentially return a default/error object or filter out.
    console.error(`Artist not found for ID: ${eventDetail.artistId} (Event ID: ${eventDetail.id}). Check data consistency.`);
    // For robustness, you might want to throw an error or return a distinctly identifiable error object.
    // Returning null here and filtering later, but this might hide issues during development.
    return null;
  }

  return {
    // From EventDetails
    id: eventDetail.id,
    artistId: eventDetail.artistId,
    title: eventDetail.title,
    // description: eventDetail.description,
    time: eventDetail.time,
    days: eventDetail.days,
    locationId: eventDetail.locationId,
    locationName: getLocationNameById(eventDetail.locationId),

    // From Artist
    artistName: artist.name,
    type: artist.type,
    image: artist.image,
  };
}).filter(event => event !== null) as Event[]; // Filter out any nulls if artists weren't found

// Helper functions (preserved from original file)
export function getEventsByDay(day: "samedi" | "dimanche") {
  return events.filter(event => event.days.includes(day));
}

export function getEventById(id: string) {
  return events.find(event => event.id === id);
}

export function getEventsByLocation(locationName: string) {
  // Récupérer le lieu par son nom
  const locations = getLocations();
  const location = locations.find(loc => loc.name === locationName);
  
  if (location) {
    // Si on a trouvé le lieu, récupérer les événements qui ont ce locationId
    return events.filter(event => event.locationId === location.id);
  }
  
  // Si on ne trouve pas le lieu, retourner un tableau vide
  return [];
}

// Get unique locations from events
export function getLocations() {
  const uniqueLocations = new Map<string, { id: string, name: string, description: string, x: number, y: number, events: string[], visited: boolean }>();
  
  // Import locations data and use it as the primary source for location information
  try {
    import('../data/locations').then(locationsModule => {
      const locationsData = locationsModule.locations;
      
      // Create a map of events by locationId
      const eventsByLocation = new Map<string, string[]>();
      events.forEach(event => {
        if (!eventsByLocation.has(event.locationId)) {
          eventsByLocation.set(event.locationId, [event.id]);
        } else {
          eventsByLocation.get(event.locationId)?.push(event.id);
        }
      });
      
      // Use locations data as the primary source
      locationsData.forEach(location => {
        const eventIds = eventsByLocation.get(location.id) || [];
        uniqueLocations.set(location.name, {
          id: location.id,
          name: location.name,
          description: location.description,
          x: location.x,
          y: location.y,
          events: eventIds,
          visited: location.visited || false
        });
      });
    }).catch(error => {
      console.warn('Could not load locations data:', error);
      // Fallback to using event data if locations cannot be loaded
      populateSynchronously();
    });
  } catch (error) {
    console.warn('Dynamic import not available, using fallback for locations:', error);
    populateSynchronously();
  }

  // Fallback function that uses event data to populate locations
  function populateSynchronously() {
    // Group events by location
    const eventsByLocation = new Map<string, string[]>();
    events.forEach(event => {
      if (!eventsByLocation.has(event.locationId)) {
        eventsByLocation.set(event.locationId, [event.id]);
      } else {
        eventsByLocation.get(event.locationId)?.push(event.id);
      }
    });
    
    // Create location entries with default coordinates
    // Note: In this fallback mode, we don't have actual coordinates
    // so we use a default value that will be corrected when locations.ts is loaded
    events.forEach(event => {
      if (!uniqueLocations.has(event.locationName)) {
        uniqueLocations.set(event.locationName, {
          id: event.locationId,
          name: event.locationName,
          description: '', // Default empty description
          x: 0, // Default coordinate, will be updated from locations.ts when available
          y: 0, // Default coordinate, will be updated from locations.ts when available
          events: eventsByLocation.get(event.locationId) || [],
          visited: false
        });
      }
    });
  }

  // Initial synchronous population before async attempt or as fallback
  if (uniqueLocations.size === 0) {
      populateSynchronously();
  }
  
  return Array.from(uniqueLocations.values());
}

// Get location ID from event ID
export function getLocationIdForEvent(eventId: string): string | null {
  const event = getEventById(eventId);
  if (!event) return null;
  
  return event.locationId;
}
