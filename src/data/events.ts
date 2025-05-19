// Unified events data for both map and program views
export type Event = {
  id: string;
  title: string;
  artistName: string;
  type: "exposition" | "concert";
  description: string;
  artistBio: string;
  contact: string;
  time: string;
  days: ("samedi" | "dimanche")[];
  // Location information
  locationId: string; // Référence à l'ID du lieu
  locationName: string; // Nom du lieu (pour la rétrocompatibilité)
  x: number; // Coordonnées (pour la rétrocompatibilité)
  y: number; // Coordonnées (pour la rétrocompatibilité)
  image?: string;
};

export const events: Event[] = [
  {
    id: "expo3",
    title: "Illustrations et Carnets",
    artistName: "Emmanuelle Boisson (Manoukidessine)",
    type: "exposition",
    description: "Découvrez un univers tendre et poétique à travers dessins, carnets et albums jeunesse.",
    artistBio: "Portée par le désir de raconter des histoires en images, Manoukidessine explore avec tendresse les émotions, le quotidien et l'imaginaire. Elle partage son univers à travers dessins, carnets et albums jeunesse.",
    contact: "emmanuelle.boisson1@gmail.com",
    time: "10h00 - 18h00, samedi et dimanche",
    days: ["samedi", "dimanche"],
    locationId: "quai-turenne",
    locationName: "8 quai Turenne",
    x: 350,
    y: 250
  },
  {
    id: "expo5",
    title: "Peintures en Miniature",
    artistName: "Catherine Clément (Kat Klementi)",
    type: "exposition",
    description: "Des créations délicates et contemporaines présentées dans de petits cadres anciens.",
    artistBio: "Dans de petits cadres anciens, l'intimité du format rencontre le charme du passé pour accueillir des créations délicates et contemporaines. Kat Klementi y déploie une peinture sensible, empreinte de douceur et de poésie.",
    contact: "katclement@orange.fr",
    time: "10h00 - 18h00, samedi et dimanche",
    days: ["samedi", "dimanche"],
    locationId: "quai-turenne",
    locationName: "8 quai Turenne",
    x: 350,
    y: 250
  },
  {
    id: "expo7",
    title: "Entre Bretagne et Maroc",
    artistName: "Mostapha Rouine",
    type: "exposition",
    description: "Aquarelles, brou de noix et huiles inspirés par la Bretagne et le Maroc.",
    artistBio: "Puisant son inspiration entre la Bretagne et le Maroc, entre pêche à pied et scènes de vie quotidienne, Mostapha Rouine crée avec aquarelles, brou de noix et huiles. L'artiste peintre autodidacte fait vibrer la lumière, l'ambiance et les couleurs de ces deux mondes.",
    contact: "rouinemostapha@gmail.com",
    time: "10h00 - 18h00, samedi et dimanche",
    days: ["samedi", "dimanche"],
    locationId: "quai-turenne",
    locationName: "8 quai Turenne",
    x: 350,
    y: 250
  },
  {
    id: "expo9",
    title: "Carnets Nantais",
    artistName: "Jocelyn Prouff (Joss Proof)",
    type: "exposition",
    description: "Croquis urbains où la nature reprend ses droits, avec une attention particulière à la lumière et aux détails.",
    artistBio: "Croquant in situ des lieux urbains où la nature reprend ses droits, avec une attention particulière à la lumière et aux détails, Joss Proof invite à un autre regard sur la ville à travers ses carnets sensibles. Il partage cet univers dans son livre \"Carnets Nantais\".",
    contact: "joss.proof@gmail.com",
    time: "10h00 - 18h00, samedi et dimanche",
    days: ["samedi", "dimanche"],
    locationId: "quai-turenne",
    locationName: "8 quai Turenne",
    x: 350,
    y: 250
  }
];

// Helper functions to get events in different formats
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
  
  // Import locations data to get descriptions
  import('../data/locations').then(locationsModule => {
    const locationsData = locationsModule.locations;
    
    events.forEach(event => {
      if (!uniqueLocations.has(event.locationName)) {
        // Trouver la description du lieu dans les données de lieux
        const locationData = locationsData.find(loc => loc.id === event.locationId);
        const description = locationData ? locationData.description : '';
        
        uniqueLocations.set(event.locationName, {
          id: event.locationId, // Utiliser l'ID du lieu défini
          name: event.locationName,
          description: description,
          x: event.x,
          y: event.y,
          events: [event.id],
          visited: false
        });
      } else {
        const location = uniqueLocations.get(event.locationName);
        if (location) {
          location.events.push(event.id);
        }
      }
    });
  });
  
  // Version synchrone pour la compatibilité
  events.forEach(event => {
    if (!uniqueLocations.has(event.locationName)) {
      uniqueLocations.set(event.locationName, {
        id: event.locationId,
        name: event.locationName,
        description: '', // La description sera mise à jour par le service de données
        x: event.x,
        y: event.y,
        events: [event.id],
        visited: false
      });
    } else {
      const location = uniqueLocations.get(event.locationName);
      if (location) {
        location.events.push(event.id);
      }
    }
  });
  
  return Array.from(uniqueLocations.values());
}

// Get location ID from event ID
export function getLocationIdForEvent(eventId: string): string | null {
  const event = getEventById(eventId);
  if (!event) return null;
  
  return event.locationId;
}
