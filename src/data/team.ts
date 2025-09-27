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
    name: "Julien Fritsch",
    role: "Président",
    description: "Organisateur du projet."
  },
  {
    id: "member2",
    name: "Philippe Châtel",
    role: "Trésorier",
    description: "Coordonne les communications et partenariats artistiques."
  },
  {
    id: "member3",
    name: "Edwige Filleux",
    role: "Secrétaire",
    description: "Fondation de l'association."
  }
];

