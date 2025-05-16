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
  day: "samedi" | "dimanche";
  // Location information
  locationName: string;
  locationDescription: string;
  x: number;
  y: number;
  image?: string;
};

export const events: Event[] = [
  {
    id: "expo1",
    title: "Photographie Urbaine",
    artistName: "Marie Dupont",
    type: "exposition",
    description: "Une exploration visuelle de l'architecture urbaine de Nantes au fil du temps.",
    artistBio: "Photographe nantaise spécialisée dans l'architecture urbaine.",
    contact: "marie.dupont@example.com",
    time: "14h00 - 18h00",
    day: "samedi",
    locationName: "Hall Principal",
    locationDescription: "Notre hall principal accueille les plus grandes expositions et sert de point d'accueil pour les visiteurs.",
    x: 30,
    y: 40
  },
  {
    id: "concert1",
    title: "Jazz Manouche",
    artistName: "Trio Rivière",
    type: "concert",
    description: "Un concert de jazz manouche inspiré par Django Reinhardt.",
    artistBio: "Groupe local de jazz formé en 2018.",
    contact: "trioriviere@example.com",
    time: "16h00 - 17h00",
    day: "samedi",
    locationName: "Cour Intérieure",
    locationDescription: "Cet espace à ciel ouvert est idéal pour les concerts et performances. Datant du XVIIIe siècle, la cour est entourée d'architecture historique.",
    x: 60,
    y: 55
  },
  {
    id: "expo2",
    title: "Sculptures Contemporaines",
    artistName: "Jean Mercier",
    type: "exposition",
    description: "Des créations contemporaines réalisées à partir de matériaux recyclés.",
    artistBio: "Sculpteur autodidacte travaillant principalement avec des matériaux recyclés.",
    contact: "jean.m@example.com",
    time: "10h00 - 19h00",
    day: "dimanche",
    locationName: "Galerie Est",
    locationDescription: "Ancienne écurie reconvertie en galerie d'art, cet espace conserve ses poutres et pierres d'origine.",
    x: 75,
    y: 30
  },
  {
    id: "concert2",
    title: "Folk Acoustique",
    artistName: "Luna & Les Étoiles",
    type: "concert",
    description: "Un concert acoustique aux influences folk et celtiques.",
    artistBio: "Groupe formé à Nantes en 2020, spécialisé dans la musique folk.",
    contact: "luna.etoiles@example.com",
    time: "18h30 - 19h30",
    day: "dimanche",
    locationName: "Jardin",
    locationDescription: "Notre jardin paysager offre un cadre naturel apaisant pour les concerts acoustiques et les installations artistiques en plein air.",
    x: 45,
    y: 75
  }
];

// Helper functions to get events in different formats
export function getEventsByDay(day: "samedi" | "dimanche") {
  return events.filter(event => event.day === day);
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
  
  events.forEach(event => {
    if (!uniqueLocations.has(event.locationName)) {
      uniqueLocations.set(event.locationName, {
        id: event.id.split('').reverse().join(''), // Create a unique ID based on event ID
        name: event.locationName,
        description: event.locationDescription,
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
