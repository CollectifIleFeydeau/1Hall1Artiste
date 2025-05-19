
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
    description: "Foundation de l'association et coordonne les communications et les partenariats artistiques."
  },
  {
    id: "member3",
    name: "Edwige Filleux",
    role: "Secrétaire",
    description: "Foundation de l'association."
  }
];
