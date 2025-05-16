
// Locations data for the map
export type Location = {
  id: string;
  name: string;
  x: number;
  y: number;
  description: string;
  events: string[];
  visited?: boolean;
};

export const locations: Location[] = [
  {
    id: "hall1",
    name: "Hall Principal",
    x: 30,
    y: 40,
    description: "Notre hall principal accueille les plus grandes expositions et sert de point d'accueil pour les visiteurs.",
    events: ["expo1"],
    visited: false
  },
  {
    id: "courtyard",
    name: "Cour Intérieure",
    x: 60,
    y: 55,
    description: "Cet espace à ciel ouvert est idéal pour les concerts et performances. Datant du XVIIIe siècle, la cour est entourée d'architecture historique.",
    events: ["concert1"],
    visited: false
  },
  {
    id: "hall2",
    name: "Galerie Est",
    x: 75,
    y: 30,
    description: "Ancienne écurie reconvertie en galerie d'art, cet espace conserve ses poutres et pierres d'origine.",
    events: ["expo2"],
    visited: false
  },
  {
    id: "garden",
    name: "Jardin",
    x: 45,
    y: 75,
    description: "Notre jardin paysager offre un cadre naturel apaisant pour les concerts acoustiques et les installations artistiques en plein air.",
    events: ["concert2"],
    visited: false
  }
];
