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
  locationName: string;
  locationDescription: string;
  x: number;
  y: number;
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
    locationName: "8 quai Turenne",
    locationDescription: "Bâtiment historique du XVIIIe siècle situé au 8 allée Turenne/9 rue Kervégan. Construit en 1753 pour Jacques Berouette, négociant et actionnaire d'origine du lotissement de l'Île Feydeau. L'immeuble présente des façades richement décorées avec des mascarons à thèmes marins. Les façades et la cage d'escalier sont inscrites aux monuments historiques depuis 1984.",
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
    locationName: "8 quai Turenne",
    locationDescription: "Bâtiment historique du XVIIIe siècle situé au 8 allée Turenne/9 rue Kervégan. Construit en 1753 pour Jacques Berouette, négociant et actionnaire d'origine du lotissement de l'Île Feydeau. L'immeuble présente des façades richement décorées avec des mascarons à thèmes marins. Les façades et la cage d'escalier sont inscrites aux monuments historiques depuis 1984.",
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
    locationName: "8 quai Turenne",
    locationDescription: "Bâtiment historique du XVIIIe siècle situé au 8 allée Turenne/9 rue Kervégan. Construit en 1753 pour Jacques Berouette, négociant et actionnaire d'origine du lotissement de l'Île Feydeau. L'immeuble présente des façades richement décorées avec des mascarons à thèmes marins. Les façades et la cage d'escalier sont inscrites aux monuments historiques depuis 1984.",
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
    locationName: "8 quai Turenne",
    locationDescription: "Bâtiment historique du XVIIIe siècle situé au 8 allée Turenne/9 rue Kervégan. Construit en 1753 pour Jacques Berouette, négociant et actionnaire d'origine du lotissement de l'Île Feydeau. L'immeuble présente des façades richement décorées avec des mascarons à thèmes marins. Les façades et la cage d'escalier sont inscrites aux monuments historiques depuis 1984.",
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
  
  events.forEach(event => {
    if (!uniqueLocations.has(event.locationName)) {
      uniqueLocations.set(event.locationName, {
        id: event.locationName.toLowerCase().replace(/\s+/g, '-'), // Create a location ID based on name
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

// Get location ID from event ID
export function getLocationIdForEvent(eventId: string): string | null {
  const event = getEventById(eventId);
  if (!event) return null;
  
  return event.locationName.toLowerCase().replace(/\s+/g, '-');
}
