
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
    id: "quai-turenne",
    name: "8 quai Turenne",
    x: 350,
    y: 250,
    description: "Bâtiment historique du XVIIIe siècle situé au 8 allée Turenne/9 rue Kervégan. Construit en 1753 pour Jacques Berouette, négociant et actionnaire d'origine du lotissement de l'Île Feydeau. L'immeuble présente des façades richement décorées avec des mascarons à thèmes marins. Les façades et la cage d'escalier sont inscrites aux monuments historiques depuis 1984.",
    events: ["expo3", "expo5", "expo7", "expo9"],
    visited: false
  }
];
