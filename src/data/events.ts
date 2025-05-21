import { getArtistById, Artist } from './artists';

// Type for event-specific details, linking to an artist via artistId
export type EventDetails = {
  id: string; // Unique ID for this specific event instance
  artistId: string; // Foreign key to artists.ts
  title: string; // Event's own title
  description: string; // Event's own description
  time: string;
  days: ("samedi" | "dimanche")[];
  locationId: string;
  locationName: string;
  x: number;
  y: number;
};

// Combined Event type that components will use
// It mirrors the structure of the old Event type for compatibility
export type Event = {
  // Fields from EventDetails
  id: string;
  artistId: string;
  title: string; // Event's title
  description: string; // Event's description
  time: string;
  days: ("samedi" | "dimanche")[];
  locationId: string;
  locationName: string;
  x: number;
  y: number;

  // Fields from Artist
  artistName: Artist['name'];
  type: Artist['type']; // 'exposition' or 'concert'
  artistBio: Artist['bio'];
  contact: Artist['contact'];
  image?: Artist['image'];
};

// Raw schedule data: list of event-specific details
const eventScheduleData: EventDetails[] = [
  // Concerts
  {
    id: "concert-nota-bene",
    artistId: "nota-bene",
    title: "Choeur de femmes Nota Bene",
    description: "Choeur de femmes Nota Bene en concert",
    time: "14h45 - 15h15",
    days: ["samedi"],
    locationId: "quai-turenne-9-concert",
    locationName: "09 quai Turenne / 11 rue Kervégan",
    x: 260,
    y: 175
  },
  {
    id: "concert-conteurs-samedi",
    artistId: "philippe-peaud",
    title: "Conteurs",
    description: "Séance de contes avec Philippe Peaud",
    time: "16h00 - 16h45",
    days: ["samedi"],
    locationId: "quai-turenne-9-concert",
    locationName: "09 quai Turenne / 11 rue Kervégan",
    x: 260,
    y: 175
  },
  {
    id: "concert-scarabees",
    artistId: "les-scarabees-rodent", // Matched with artists.ts id
    title: "Les Scarabées Rôdent",
    description: "Concert du groupe Les Scarabées Rôdent",
    time: "17h45 - 18h15",
    days: ["samedi"],
    locationId: "quai-turenne-9-concert",
    locationName: "09 quai Turenne / 11 rue Kervégan",
    x: 260,
    y: 175
  },
  {
    id: "concert-aperto",
    artistId: "aperto", // Matched with artists.ts id
    title: "Aperto !",
    description: "Concert du groupe Aperto !",
    time: "18h30 - 19h00",
    days: ["samedi"],
    locationId: "quai-turenne-9-concert",
    locationName: "09 quai Turenne / 11 rue Kervégan",
    x: 260,
    y: 175
  },
  {
    id: "concert-quatuor-liger",
    artistId: "quatuor-liger", // Matched with artists.ts id
    title: "Quatuor Liger",
    description: "Concert du Quatuor Liger",
    time: "14h00 - 14h30",
    days: ["dimanche"],
    locationId: "quai-turenne-9-concert",
    locationName: "09 quai Turenne / 11 rue Kervégan",
    x: 260,
    y: 175
  },
  {
    id: "concert-eva",
    artistId: "eva", // Matched with artists.ts id
    title: "EVA choeur de femmes",
    description: "Concert du choeur de femmes EVA",
    time: "15h30 - 16h00",
    days: ["dimanche"],
    locationId: "quai-turenne-9-concert",
    locationName: "09 quai Turenne / 11 rue Kervégan",
    x: 260,
    y: 175
  },
  {
    id: "concert-conteurs-dimanche",
    artistId: "philippe-peaud", // Same artist, different event
    title: "Conteurs",
    description: "Séance de contes avec Philippe Peaud",
    time: "16h00 - 16h45",
    days: ["dimanche"],
    locationId: "quai-turenne-9-concert",
    locationName: "09 quai Turenne / 11 rue Kervégan",
    x: 260,
    y: 175
  },
  {
    id: "concert-swing-it",
    artistId: "swing-it", // Matched with artists.ts id
    title: "Swing it !",
    description: "Concert du groupe Swing it !",
    time: "17h00 - 17h30",
    days: ["dimanche"],
    locationId: "quai-turenne-9-concert",
    locationName: "09 quai Turenne / 11 rue Kervégan",
    x: 260,
    y: 175
  },
  {
    id: "concert-variabilis",
    artistId: "variabilis", // Matched with artists.ts id
    title: "Variabilis",
    description: "Concert du groupe Variabilis",
    time: "17h45 - 18h15",
    days: ["dimanche"],
    locationId: "quai-turenne-9-concert",
    locationName: "09 quai Turenne / 11 rue Kervégan",
    x: 260,
    y: 175
  },
  // Expositions
  {
    id: "expo-emmanuelle-boisson", // Changed ID to be more descriptive
    artistId: "emmanuelle-boisson",
    title: "Illustrations et Carnets", // This is the exhibition title
    description: "Portée par le désir de raconter des histoires en images, Manoukidessine explore avec tendresse les émotions, le quotidien et l'imaginaire. Elle partage son univers à travers dessins, carnets et albums jeunesse.",
    time: "10h00 - 18h00, samedi et dimanche",
    days: ["samedi", "dimanche"],
    locationId: "quai-turenne-8",
    locationName: "8 quai Turenne",
    x: 350,
    y: 250
  },
  {
    id: "expo-catherine-clement", // Changed ID
    artistId: "catherine-clement",
    title: "Peintures en Miniature",
    description: "Dans de petits cadres anciens, l'intimité du format rencontre le charme du passé pour accueillir des créations délicates et contemporaines. Kat Klementi y déploie une peinture sensible, empreinte de douceur et de poésie.",
    time: "10h00 - 18h00, samedi et dimanche",
    days: ["samedi", "dimanche"],
    locationId: "quai-turenne-8",
    locationName: "8 quai Turenne",
    x: 350,
    y: 250
  },
  {
    id: "expo-mostapha-rouine", // Changed ID
    artistId: "mostapha-rouine",
    title: "Entre Bretagne et Maroc",
    description: "Puisant son inspiration entre la Bretagne et le Maroc, entre pêche à pied et scènes de vie quotidienne, Mostapha Rouine crée avec aquarelles, brou de noix et huiles. L'artiste peintre autodidacte fait vibrer la lumière, l'ambiance et les couleurs de ces deux mondes.",
    time: "10h00 - 18h00, samedi et dimanche",
    days: ["samedi", "dimanche"],
    locationId: "quai-turenne-8",
    locationName: "8 quai Turenne",
    x: 350,
    y: 250
  },

  {
    id: "expo-bruno-barbier", // Changed ID (was bruno-barbier)
    artistId: "bruno-barbier",
    title: "Peintures et dessins",
    description: "Explorant les thèmes du souvenir et de la nostalgie, Bruno Barbier, artiste peintre et dessinateur installé à Nantes, évoque des fragments de mémoire, entre émotions passées et traces du temps.",
    time: "10h00 - 18h00",
    days: ["samedi", "dimanche"],
    locationId: "quai-turenne-9",
    locationName: "09 quai Turenne / 11 rue Kervégan",
    x: 260,
    y: 175
  },
  {
    id: "expo-pauline-crusson", // Changed ID (was pauline-crusson)
    artistId: "pauline-crusson",
    title: "Cartes postales du vieux Nantes",
    description: "Revisitant les cartes postales du vieux Nantes avec un style unique et détaillé, Pauline Crusson sous le nom de PaoaNaoned, redonne vie à ces images anciennes. Elle capture ainsi l'essence de la ville à travers ses dessins.",
    time: "10h00 - 18h00",
    days: ["samedi", "dimanche"],
    locationId: "rue-duguesclin",
    locationName: "Rue Duguesclin",
    x: 130,
    y: 460
  },
  {
    id: "expo-alain-gremillet",
    artistId: "alain-gremillet",
    title: "Peinture abstraite",
    description: "Associant couleurs, mouvements et lumière pour susciter l'émotion, l'artiste peintre abstrait Alain Gremillet explore librement la matière avec acrylique, spatules et objets du quotidien, donnant naissance à des œuvres uniques et lumineuses.",
    time: "10h00 - 18h00, samedi et dimanche",
    days: ["samedi", "dimanche"],
    locationId: "quai-turenne-10",
    locationName: "10 quai Turenne / 13 rue Kervégan",
    x: 280,
    y: 200
  },
  {
    id: "expo-jerome-gourdon",
    artistId: "jerome-gourdon",
    title: "Photo-émographie",
    description: "Mêlant photographie, intervention in-situ et peinture acrylique, Jérôme Gourdon se définit comme un photo-émographe. Son travail explore les frontières entre image captée et image transformée, pour créer des œuvres à la croisée des médiums.",
    time: "10h00 - 18h00, samedi et dimanche",
    days: ["samedi", "dimanche"],
    locationId: "quai-turenne-10",
    locationName: "10 quai Turenne / 13 rue Kervégan",
    x: 280,
    y: 200
  },
  {
    id: "expo-nadege-hameau",
    artistId: "nadege-hameau",
    title: "Marqueur acrylique",
    description: "Des mondes imaginaires prennent forme au marqueur acrylique, dans un style mêlant pointillisme, précision et rêverie. Autodidacte, Nadhame.artiste, alias Nadège Hameau, cultive une démarche empreinte de patience et de poésie visuelle.",
    time: "10h00 - 18h00, samedi et dimanche",
    days: ["samedi", "dimanche"],
    locationId: "quai-turenne-10",
    locationName: "10 quai Turenne / 13 rue Kervégan",
    x: 290,
    y: 210
  },
  {
    id: "expo-pauline-crusson",
    artistId: "pauline-crusson",
    title: "PaoaNaoned",
    description: "Revisitant les cartes postales du vieux Nantes avec un style unique et détaillé, Pauline Crusson sous le nom de PaoaNaoned, redonne vie à ces images anciennes. Elle capture ainsi l'essence de la ville à travers ses dessins.",
    time: "10h00 - 18h00, samedi et dimanche",
    days: ["samedi", "dimanche"],
    locationId: "quai-turenne-10",
    locationName: "10 quai Turenne / 13 rue Kervégan",
    x: 320,
    y: 230
  },
  {
    id: "expo-marie-husson",
    artistId: "marie-husson",
    title: "Dessins et peintures",
    description: "Explorant des instants d'intimité à la lisière du visible, Marie Husson archive ses découvertes sous forme de dessins et peintures mêlant aquarelle, encre, broderie ou huile. Sa pratique, expérimentale et sensible, donne naissance à des images profondes, fragiles et puissamment poétiques.",
    time: "10h00 - 18h00, samedi et dimanche",
    days: ["samedi", "dimanche"],
    locationId: "rue-kervegan-17",
    locationName: "17 rue Kervégan / 11 quai Turenne",
    x: 340,
    y: 240
  },
  {
    id: "expo-clotilde-debar-zablocki",
    artistId: "clotilde-debar-zablocki",
    title: "apolline.design",
    description: "Inspirée par l'histoire et le patrimoine local, notamment celui d'Anne de Bretagne, Clotilde Debar-Zablocki crée un univers poétique et sensible. Avec David, elle forme le duo apolline.design, spécialisé en fresques décoratives et patines.",
    time: "10h00 - 18h00, samedi et dimanche",
    days: ["samedi", "dimanche"],
    locationId: "allee-duguay-trouin-11",
    locationName: "11 allée Duguay Trouin / 20 rue Kervégan",
    x: 360,
    y: 260
  },
  {
    id: "expo-malou-tual",
    artistId: "malou-tual",
    title: "Peinture et sculpture sur bois",
    description: "Artiste peintre et sculptrice sur bois, Malou Tual crée des œuvres uniques autour de masques ethniques et de mandalas émotionnels. Ses sculptures, façonnées à la main, allient sensibilité et tradition dans une démarche artisanale profonde.",
    time: "10h00 - 18h00, samedi et dimanche",
    days: ["samedi", "dimanche"],
    locationId: "allee-duguay-trouin-11",
    locationName: "11 allée Duguay Trouin / 20 rue Kervégan",
    x: 370,
    y: 270
  },
  {
    id: "expo-gael-caudoux",
    artistId: "gael-caudoux",
    title: "Cartographies imaginaires",
    description: "Vastes cartographies de territoires imaginaires, riches en détails et en narration, Gaël Caudoux les réalise à la main depuis l'enfance. Ses grands formats, en constante évolution, invitent à la découverte d'un univers unique et fascinant.",
    time: "10h00 - 18h00, samedi et dimanche",
    days: ["samedi", "dimanche"],
    locationId: "allee-duguay-trouin-11",
    locationName: "11 allée Duguay Trouin / 20 rue Kervégan",
    x: 300,
    y: 220
  },
  {
    id: "expo-atelier-norg",
    artistId: "atelier-norg",
    title: "Peinture, sculpture et dessin",
    description: "Norg est un plasticien basé à Nantes dont le travail navigue entre peinture, sculpture et dessin, avec une énergie brute et expressive. Son univers visuel est direct et instinctif.",
    time: "10h00 - 18h00, samedi et dimanche",
    days: ["samedi", "dimanche"],
    locationId: "allee-duguay-trouin-16",
    locationName: "16 allée Duguay Trouin",
    x: 310,
    y: 225
  },
  {
    id: "expo-jerome-luneau",
    artistId: "jerome-luneau",
    title: "Chun Yong Ho",
    description: "Chun Yong Ho, artiste peintre originaire de Corée du Sud, explore l'abstraction à travers des jeux de couleurs et de lignes évoquant des paysages mentaux. Son travail invite à un voyage intérieur, entre sensations et émotions.",
    time: "10h00 - 18h00, samedi et dimanche",
    days: ["samedi", "dimanche"],
    locationId: "allee-duguay-trouin-16",
    locationName: "16 allée Duguay Trouin",
    x: 315,
    y: 228
  },
  {
    id: "expo-jocelyn-prouff", // Changed ID (was expo9)
    artistId: "jocelyn-prouff",
    title: "Carnets Nantais",
    description: "Croquant in situ des lieux urbains où la nature reprend ses droits, avec une attention particulière à la lumière et aux détails, Joss Proof invite à un autre regard sur la ville à travers ses carnets sensibles. Il partage cet univers dans son livre \"Carnets Nantais\".",
    time: "10h00 - 18h00, samedi et dimanche",
    days: ["samedi", "dimanche"],
    locationId: "allee-duguay-trouin-16",
    locationName: "16 allée Duguay Trouin",
    x: 350,
    y: 250
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
    description: eventDetail.description,
    time: eventDetail.time,
    days: eventDetail.days,
    locationId: eventDetail.locationId,
    locationName: eventDetail.locationName,
    x: eventDetail.x,
    y: eventDetail.y,

    // From Artist
    artistName: artist.name,
    type: artist.type,
    artistBio: artist.bio,
    contact: artist.contact,
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
  return events.filter(event => event.locationName === locationName);
}

// Get unique locations from events
export function getLocations() {
  const uniqueLocations = new Map<string, { id: string, name: string, description: string, x: number, y: number, events: string[], visited: boolean }>();
  
  // Attempt to load full descriptions asynchronously
  // The try-catch is to handle cases where dynamic import might not be supported (e.g. certain test environments or older bundlers)
  try {
    import('../data/locations').then(locationsModule => {
      const locationsData = locationsModule.locations;
      // This part repopulates or updates descriptions if async load succeeds.
      // It might run after the initial synchronous population.
      events.forEach(event => {
        if (!uniqueLocations.has(event.locationName)) {
          const locationData = locationsData.find(loc => loc.id === event.locationId);
          const description = locationData ? locationData.description : '';
          uniqueLocations.set(event.locationName, {
            id: event.locationId,
            name: event.locationName,
            description: description, // Use fetched description
            x: event.x,
            y: event.y,
            events: [event.id],
            visited: false
          });
        } else {
          const location = uniqueLocations.get(event.locationName);
          if (location && !location.description) { // Update description if not already set by a more specific source
             const locationData = locationsData.find(loc => loc.id === event.locationId);
             if (locationData && locationData.description) {
                location.description = locationData.description;
             }
          }
          location?.events.push(event.id);
        }
      });
    }).catch(error => {
      console.warn('Optional module ../data/locations could not be loaded for descriptions:', error);
      // Proceed with synchronous population if import fails
      populateSynchronously();
    });
  } catch (error) {
     console.warn('Dynamic import for ../data/locations not available, using synchronous fallback for locations:', error);
     populateSynchronously();
  }

  // Synchronous population (fallback or initial population)
  // This ensures uniqueLocations is populated immediately.
  // If async load succeeds later, descriptions might be updated.
  function populateSynchronously() {
    events.forEach(event => {
      if (!uniqueLocations.has(event.locationName)) {
        uniqueLocations.set(event.locationName, {
          id: event.locationId,
          name: event.locationName,
          description: '', // Default empty description
          x: event.x,
          y: event.y,
          events: [event.id],
          visited: false
        });
      } else {
        uniqueLocations.get(event.locationName)?.events.push(event.id);
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
