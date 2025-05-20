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
  // Concerts
  {
    id: "concert-nota-bene",
    title: "Choeur de femmes Nota Bene",
    artistName: "Nota Bene",
    type: "concert",
    description: "Choeur de femmes Nota Bene en concert",
    artistBio: "Choeur de femmes Nota Bene",
    contact: "contact@notabene.fr",
    time: "14h45 - 15h15",
    days: ["samedi"],
    locationId: "quai-turenne-9-concert",
    locationName: "09 quai Turenne / 11 rue Kervégan",
    x: 260,
    y: 175
  },
  {
    id: "concert-conteurs-samedi",
    title: "Conteurs",
    artistName: "Philippe Peaud et autres conteurs",
    type: "concert",
    description: "Séance de contes avec Philippe Peaud et d'autres conteurs",
    artistBio: "Philippe Peaud et autres conteurs",
    contact: "contact@conteurs.fr",
    time: "16h00 - 16h45",
    days: ["samedi"],
    locationId: "quai-turenne-9-concert",
    locationName: "09 quai Turenne / 11 rue Kervégan",
    x: 260,
    y: 175
  },
  {
    id: "concert-scarabees",
    title: "Les Scarabées Rôdent",
    artistName: "Les Scarabées Rôdent",
    type: "concert",
    description: "Concert du groupe Les Scarabées Rôdent",
    artistBio: "Les Scarabées Rôdent",
    contact: "contact@scarabees.fr",
    time: "17h45 - 18h15",
    days: ["samedi"],
    locationId: "quai-turenne-9-concert",
    locationName: "09 quai Turenne / 11 rue Kervégan",
    x: 260,
    y: 175
  },
  {
    id: "concert-aperto",
    title: "Aperto !",
    artistName: "Aperto !",
    type: "concert",
    description: "Concert du groupe Aperto !",
    artistBio: "Aperto !",
    contact: "contact@aperto.fr",
    time: "18h30 - 19h00",
    days: ["samedi"],
    locationId: "quai-turenne-9-concert",
    locationName: "09 quai Turenne / 11 rue Kervégan",
    x: 260,
    y: 175
  },
  {
    id: "concert-quatuor-liger",
    title: "Quatuor Liger",
    artistName: "Quatuor Liger",
    type: "concert",
    description: "Concert du Quatuor Liger",
    artistBio: "Quatuor Liger",
    contact: "contact@quatuorliger.fr",
    time: "14h00 - 14h30",
    days: ["dimanche"],
    locationId: "quai-turenne-9-concert",
    locationName: "09 quai Turenne / 11 rue Kervégan",
    x: 260,
    y: 175
  },
  {
    id: "concert-eva",
    title: "EVA choeur de femmes",
    artistName: "EVA",
    type: "concert",
    description: "Concert du choeur de femmes EVA",
    artistBio: "EVA choeur de femmes",
    contact: "contact@eva-choeur.fr",
    time: "15h30 - 16h00",
    days: ["dimanche"],
    locationId: "quai-turenne-9-concert",
    locationName: "09 quai Turenne / 11 rue Kervégan",
    x: 260,
    y: 175
  },
  {
    id: "concert-conteurs-dimanche",
    title: "Conteurs",
    artistName: "Philippe Peaud et autres conteurs",
    type: "concert",
    description: "Séance de contes avec Philippe Peaud et d'autres conteurs",
    artistBio: "Philippe Peaud et autres conteurs",
    contact: "contact@conteurs.fr",
    time: "16h00 - 16h45",
    days: ["dimanche"],
    locationId: "quai-turenne-9-concert",
    locationName: "09 quai Turenne / 11 rue Kervégan",
    x: 260,
    y: 175
  },
  {
    id: "concert-swing-it",
    title: "Swing it !",
    artistName: "Swing it !",
    type: "concert",
    description: "Concert du groupe Swing it !",
    artistBio: "Swing it !",
    contact: "contact@swingit.fr",
    time: "17h00 - 17h30",
    days: ["dimanche"],
    locationId: "quai-turenne-9-concert",
    locationName: "09 quai Turenne / 11 rue Kervégan",
    x: 260,
    y: 175
  },
  {
    id: "concert-variabilis",
    title: "Variabilis",
    artistName: "Variabilis",
    type: "concert",
    description: "Concert du groupe Variabilis",
    artistBio: "Variabilis",
    contact: "contact@variabilis.fr",
    time: "17h45 - 18h15",
    days: ["dimanche"],
    locationId: "quai-turenne-9-concert",
    locationName: "09 quai Turenne / 11 rue Kervégan",
    x: 260,
    y: 175
  },
  
  // Événements existants
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
    locationId: "quai-turenne-8",
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
    locationId: "quai-turenne-8",
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
    locationId: "quai-turenne-8",
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
    locationId: "quai-turenne-8",
    locationName: "8 quai Turenne",
    x: 350,
    y: 250
  },

  // 09 quai Turenne / 11 rue Kervégan
  {
    id: "bruno-barbier",
    title: "Peintures et dessins",
    artistName: "Bruno Barbier",
    type: "exposition",
    description: "Explorant les thèmes du souvenir et de la nostalgie, Bruno Barbier, artiste peintre et dessinateur installé à Nantes, évoque des fragments de mémoire, entre émotions passées et traces du temps.",
    artistBio: "Artiste peintre et dessinateur installé à Nantes",
    contact: "barbier_bruno@orange.fr",
    time: "10h00 - 18h00",
    days: ["samedi", "dimanche"],
    locationId: "quai-turenne-9",
    locationName: "09 quai Turenne / 11 rue Kervégan",
    x: 260,
    y: 165
  },

  // 10 quai Turenne / 13 rue Kervégan
  {
    id: "alain-gremillet",
    title: "Peinture abstraite",
    artistName: "Alain Gremillet",
    type: "exposition",
    description: "Associant couleurs, mouvements et lumière pour susciter l'émotion, l'artiste peintre abstrait Alain Gremillet explore librement la matière avec acrylique, spatules et objets du quotidien, donnant naissance à des œuvres uniques et lumineuses.",
    artistBio: "Artiste peintre abstrait",
    contact: "agap44@orange.fr",
    time: "10h00 - 18h00",
    days: ["samedi", "dimanche"],
    locationId: "quai-turenne-10",
    locationName: "10 quai Turenne / 13 rue Kervégan",
    x: 260,
    y: 224
  },
  {
    id: "jerome-gourdon",
    title: "Photo-émographie",
    artistName: "Jérôme Gourdon",
    type: "exposition",
    description: "Mêlant photographie, intervention in-situ et peinture acrylique, Jérôme Gourdon se définit comme un photo-émographe. Son travail explore les frontières entre image captée et image transformée, pour créer des œuvres à la croisée des médiums.",
    artistBio: "Photo-émographe",
    contact: "gourdon49@sfr.fr",
    time: "10h00 - 18h00",
    days: ["samedi", "dimanche"],
    locationId: "quai-turenne-10",
    locationName: "10 quai Turenne / 13 rue Kervégan",
    x: 260,
    y: 224
  },
  {
    id: "nadege-hameau",
    title: "Marqueur acrylique",
    artistName: "Nadège Hameau",
    type: "exposition",
    description: "Des mondes imaginaires prennent forme au marqueur acrylique, dans un style mêlant pointillisme, précision et rêverie. Autodidacte, Nadhame.artiste, alias Nadège Hameau, cultive une démarche empreinte de patience et de poésie visuelle.",
    artistBio: "Artiste autodidacte",
    contact: "nadhame.artiste@gmail.com",
    time: "10h00 - 18h00",
    days: ["samedi", "dimanche"],
    locationId: "quai-turenne-10",
    locationName: "10 quai Turenne / 13 rue Kervégan",
    x: 260,
    y: 224
  },
  {
    id: "pauline-crusson",
    title: "PaoaNaoned",
    artistName: "Pauline Crusson",
    type: "exposition",
    description: "Revisitant les cartes postales du vieux Nantes avec un style unique et détaillé, Pauline Crusson sous le nom de PaoaNaoned, redonne vie à ces images anciennes. Elle capture ainsi l'essence de la ville à travers ses dessins.",
    artistBio: "Illustratrice nantaise",
    contact: "pauline.elisabeth.crusson@gmail.com",
    time: "10h00 - 18h00",
    days: ["samedi", "dimanche"],
    locationId: "quai-turenne-10",
    locationName: "10 quai Turenne / 13 rue Kervégan",
    x: 260,
    y: 224
  },

  // 17 rue Kervégan / 11 quai Turenne
  {
    id: "marie-husson",
    title: "Dessins et peintures",
    artistName: "Marie Husson",
    type: "exposition",
    description: "Explorant des instants d'intimité à la lisière du visible, Marie Husson archive ses découvertes sous forme de dessins et peintures mêlant aquarelle, encre, broderie ou huile. Sa pratique, expérimentale et sensible, donne naissance à des images profondes, fragiles et puissamment poétiques.",
    artistBio: "Artiste peintre et dessinatrice",
    contact: "contact@mariehusson.art",
    time: "10h00 - 18h00",
    days: ["samedi", "dimanche"],
    locationId: "rue-kervegan-17",
    locationName: "17 rue Kervégan / 11 quai Turenne",
    x: 260,
    y: 407
  },

  // 11 allée Duguay Trouin / 20 rue Kervégan
  {
    id: "clotilde-debar-zablocki",
    title: "apolline.design",
    artistName: "Clotilde Debar Zablocki",
    type: "exposition",
    description: "Inspirée par l'histoire et le patrimoine local, notamment celui d'Anne de Bretagne, Clotilde Debar-Zablocki crée un univers poétique et sensible. Avec David, elle forme le duo apolline.design, spécialisé en fresques décoratives et patines.",
    artistBio: "Artiste et décoratrice",
    contact: "apollinedesign@gmail.com",
    time: "10h00 - 18h00",
    days: ["samedi", "dimanche"],
    locationId: "allee-duguay-trouin-11",
    locationName: "11 allée Duguay Trouin / 20 rue Kervégan",
    x: 150,
    y: 186
  },
  {
    id: "malou-tual",
    title: "Peinture et sculpture sur bois",
    artistName: "Malou Tual",
    type: "exposition",
    description: "Artiste peintre et sculptrice sur bois, Malou Tual crée des œuvres uniques autour de masques ethniques et de mandalas émotionnels. Ses sculptures, façonnées à la main, allient sensibilité et tradition dans une démarche artisanale profonde.",
    artistBio: "Artiste peintre et sculptrice sur bois",
    contact: "tual.malou@gmail.com",
    time: "10h00 - 18h00",
    days: ["samedi", "dimanche"],
    locationId: "allee-duguay-trouin-11",
    locationName: "11 allée Duguay Trouin / 20 rue Kervégan",
    x: 150,
    y: 186
  },
  {
    id: "gael-caudoux",
    title: "Cartographies imaginaires",
    artistName: "Gaël Caudoux",
    type: "exposition",
    description: "Vastes cartographies de territoires imaginaires, riches en détails et en narration, Gaël Caudoux les réalise à la main depuis l'enfance. Ses grands formats, en constante évolution, invitent à la découverte d'un univers unique et fascinant.",
    artistBio: "Artiste cartographe",
    contact: "gael.caudoux.art@gmail.com",
    time: "10h00 - 18h00",
    days: ["samedi", "dimanche"],
    locationId: "allee-duguay-trouin-11",
    locationName: "11 allée Duguay Trouin / 20 rue Kervégan",
    x: 150,
    y: 186
  },

  // 16 allée Duguay Trouin
  {
    id: "atelier-norg",
    title: "Peinture, sculpture et dessin",
    artistName: "Atelier Norg",
    type: "exposition",
    description: "Norg est un plasticien basé à Nantes dont le travail navigue entre peinture, sculpture et dessin, avec une énergie brute et expressive. Son univers visuel est direct et instinctif.",
    artistBio: "Plasticien nantais",
    contact: "atelier.norg@gmail.com",
    time: "10h00 - 18h00",
    days: ["samedi", "dimanche"],
    locationId: "allee-duguay-trouin-16",
    locationName: "16 allée Duguay Trouin",
    x: 150,
    y: 450
  },
  {
    id: "jerome-luneau",
    title: "Chun Yong Ho",
    artistName: "Jérôme Luneau",
    type: "exposition",
    description: "Chun Yong Ho, artiste peintre originaire de Corée du Sud, explore l'abstraction à travers des jeux de couleurs et de lignes évoquant des paysages mentaux. Son travail invite à un voyage intérieur, entre sensations et émotions.",
    artistBio: "Artiste peintre originaire de Corée du Sud",
    contact: "yongho@hotmail.fr",
    time: "10h00 - 18h00",
    days: ["samedi", "dimanche"],
    locationId: "allee-duguay-trouin-16",
    locationName: "16 allée Duguay Trouin",
    x: 150,
    y: 450
  },
  {
    id: "pauline-crusson",
    title: "Cartes postales du vieux Nantes",
    artistName: "Pauline Crusson (PaoaNaoned)",
    type: "exposition",
    description: "Revisitant les cartes postales du vieux Nantes avec un style unique et détaillé, Pauline Crusson sous le nom de PaoaNaoned, redonne vie à ces images anciennes. Elle capture ainsi l'essence de la ville à travers ses dessins.",
    artistBio: "Artiste illustratrice nantaise",
    contact: "pauline.elisabeth.crusson@gmail.com",
    time: "10h00 - 18h00",
    days: ["samedi", "dimanche"],
    locationId: "rue-duguesclin",
    locationName: "Rue Duguesclin",
    x: 130,
    y: 460
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
