
// Artists data for exhibitions and concerts
export type Artist = {
  id: string;
  name: string;
  type: "exposition" | "concert";
  title: string;
  description: string;
  time: string;
  location: string;
  day: "samedi" | "dimanche";
  bio: string;
  contact: string;
  image?: string;
};

export const artists: Artist[] = [
  {
    id: "expo1",
    name: "Marie Dupont",
    type: "exposition",
    title: "Photographie Urbaine",
    description: "Une exploration visuelle de l'architecture urbaine de Nantes au fil du temps.",
    time: "14h00 - 18h00",
    location: "Hall Principal",
    day: "samedi",
    bio: "Photographe nantaise spécialisée dans l'architecture urbaine.",
    contact: "marie.dupont@example.com"
  },
  {
    id: "concert1",
    name: "Trio Rivière",
    type: "concert",
    title: "Jazz Manouche",
    description: "Un concert de jazz manouche inspiré par Django Reinhardt.",
    time: "16h00 - 17h00",
    location: "Cour Intérieure",
    day: "samedi",
    bio: "Groupe local de jazz formé en 2018.",
    contact: "trioriviere@example.com"
  },
  {
    id: "expo2",
    name: "Jean Mercier",
    type: "exposition",
    title: "Sculptures Contemporaines",
    description: "Des créations contemporaines réalisées à partir de matériaux recyclés.",
    time: "10h00 - 19h00",
    location: "Galerie Est",
    day: "dimanche",
    bio: "Sculpteur autodidacte travaillant principalement avec des matériaux recyclés.",
    contact: "jean.m@example.com"
  },
  {
    id: "concert2",
    name: "Luna & Les Étoiles",
    type: "concert",
    title: "Folk Acoustique",
    description: "Un concert acoustique aux influences folk et celtiques.",
    time: "18h30 - 19h30",
    location: "Jardin",
    day: "dimanche",
    bio: "Groupe formé à Nantes en 2020, spécialisé dans la musique folk.",
    contact: "luna.etoiles@example.com"
  }
];
