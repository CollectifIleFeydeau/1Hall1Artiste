
// Team members data
export type TeamMember = {
  id: string;
  name: string;
  role: string;
  description: string;
  image?: string;
};

export const teamMembers: TeamMember[] = [
  {
    id: "member1",
    name: "Claire Martin",
    role: "Présidente",
    description: "Fondatrice de l'association et passionnée d'histoire locale."
  },
  {
    id: "member2",
    name: "Thomas Rivière",
    role: "Trésorier",
    description: "En charge des finances et de la logistique des événements."
  },
  {
    id: "member3",
    name: "Sophie Laurent",
    role: "Secrétaire",
    description: "Coordonne les communications et les partenariats artistiques."
  },
  {
    id: "member4",
    name: "Marc Dubois",
    role: "Programmation artistique",
    description: "Sélectionne les artistes et organise les expositions."
  },
  {
    id: "member5",
    name: "Émilie Blanc",
    role: "Communication",
    description: "Gère la présence en ligne et les relations avec la presse."
  }
];
