// Association information
export type AssociationInfo = {
  name: string;
  shortName: string;
  description: string;
  yearFounded: number;
  memberCount: number;
  eventWeekend: string;
  contactEmail: string;
  instagram: string;
};

export const associationInfo: AssociationInfo = {
  name: "Collectif Ile Feydeau",
  shortName: "FEYDEAU",
  description: "Association culturelle mettant en valeur le patrimoine historique d'un ancien quartier insulaire de Nantes.",
  yearFounded: 2017,
  memberCount: 20,
  eventWeekend: "Troisième week-end de septembre",
  contactEmail: "collectif.ile.feydeau@gmail.com",
  instagram: "https://www.instagram.com/collectif_ile_feydeau"
};

