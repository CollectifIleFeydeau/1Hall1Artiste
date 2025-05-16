
// Association information
export type AssociationInfo = {
  name: string;
  shortName: string;
  description: string;
  yearFounded: number;
  memberCount: number;
  eventWeekend: string;
  contactEmail: string;
};

export const associationInfo: AssociationInfo = {
  name: "Nantes Association Culturelle",
  shortName: "NAC",
  description: "Association culturelle mettant en valeur le patrimoine historique d'un ancien quartier insulaire de Nantes.",
  yearFounded: 2010,
  memberCount: 20,
  eventWeekend: "Troisième week-end de septembre",
  contactEmail: "contact@nac-example.org"
};
