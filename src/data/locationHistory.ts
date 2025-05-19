// Historiques détaillés des lieux
export type LocationHistory = {
  id: string;
  name: string;
  fullHistory: string;
};

export const locationHistories: LocationHistory[] = [
  {
    id: "quai-turenne",
    name: "8 quai Turenne",
    fullHistory: `

# Habité par un des actionnaires d'origine

Jacques Berouette, négociant et avocat du roi est l'un des actionnaires d'origine de la compagnie créée pour construire le lotissement. En 1753, il habite sa nouvelle maison de l'Île Feydeau.

# Le bâti

Les deux façades de l'immeuble ont beaucoup de points communs avec le 15, allée Duguay-Trouin/28, rue Kervégan. Celle côté quai est plus richement décorée. Les mascarons traitent de thèmes marins. 

Contrairement à beaucoup d'immeubles pour lesquels l'escalier est situé dans une tourelle, il a été choisi ici de l'intégrer au bâti. Il donne sur chacun des couloirs d'entrée. Le mur-noyau en est ajouré pour donner plus de clarté. 

Le balcon du 1er étage est monté sur des consoles, celui du 2ème en encorbellement sur une Trompe.

# Les matériaux

La partie basse du rez-de-chaussée est construite en granite alors que la partie haute et notamment les mascarons sont en calcaire de Saint-Savinien (Charente maritime), une pierre semi-dure. 

Les étages sont construits en tuffeau de la région de Saumur.

# Un immeuble inscrit

En 1933, les deux immeubles ont été séparés. La restauration de chacun a été effectuée à quelques années d'intervalle. 

Les façades sur rue et sur cour ainsi que la cage d'escalier ont été inscrits à l'inventaire supplémentaire des monuments historiques le 5 décembre 1984.
`
  }
];

// Fonction pour récupérer l'historique complet d'un lieu par son id
export function getLocationHistoryById(id: string): LocationHistory | undefined {
  return locationHistories.find(history => history.id === id);
}
