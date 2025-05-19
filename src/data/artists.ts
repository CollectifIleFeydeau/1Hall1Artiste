
// Artists data for exhibitions and concerts
export type Artist = {
  id: string;
  name: string;
  type: "exposition" | "concert";
  title: string;
  description: string;
  time: string;
  location: string;
  locationId: string;
  space?: string;
  days: ("samedi" | "dimanche")[];
  bio: string;
  contact: string;
  instagram?: string;
  image?: string;
};

export const artists: Artist[] = [
  // 09 quai Turenne / 11 rue Kervégan
  {
    id: "bruno-barbier",
    name: "Bruno Barbier",
    type: "exposition",
    title: "Peintures et dessins",
    description: "Explorant les thèmes du souvenir et de la nostalgie, Bruno Barbier, artiste peintre et dessinateur installé à Nantes, évoque des fragments de mémoire, entre émotions passées et traces du temps.",
    time: "10:00-18:00",
    location: "09 quai Turenne / 11 rue Kervégan",
    locationId: "quai-turenne-9",
    space: "Sur les grilles de la cour",
    days: ["samedi", "dimanche"],
    bio: "Artiste peintre et dessinateur installé à Nantes",
    contact: "barbier_bruno@orange.fr",
    instagram: "www.instagram.com/brunobarbierpainter"
  },

  // 10 quai Turenne / 13 rue Kervégan
  {
    id: "alain-gremillet",
    name: "Alain Gremillet",
    type: "exposition",
    title: "Peinture abstraite",
    description: "Associant couleurs, mouvements et lumière pour susciter l'émotion, l'artiste peintre abstrait Alain Gremillet explore librement la matière avec acrylique, spatules et objets du quotidien, donnant naissance à des œuvres uniques et lumineuses.",
    time: "10:00-18:00",
    location: "10 quai Turenne / 13 rue Kervégan",
    locationId: "quai-turenne-10",
    space: "Moitié cour coté ouest + hall quai Turenne",
    days: ["samedi", "dimanche"],
    bio: "Artiste peintre abstrait",
    contact: "agap44@orange.fr",
    instagram: "www.instagram.com/alaingremillet"
  },
  {
    id: "jerome-gourdon",
    name: "Jérôme Gourdon",
    type: "exposition",
    title: "Photo-émographie",
    description: "Mêlant photographie, intervention in-situ et peinture acrylique, Jérôme Gourdon se définit comme un photo-émographe. Son travail explore les frontières entre image captée et image transformée, pour créer des œuvres à la croisée des médiums.",
    time: "10:00-18:00",
    location: "10 quai Turenne / 13 rue Kervégan",
    locationId: "quai-turenne-10",
    space: "Cour coté est",
    days: ["samedi", "dimanche"],
    bio: "Photo-émographe",
    contact: "gourdon49@sfr.fr",
    instagram: "www.instagram.com/jerome_gourdon"
  },
  {
    id: "nadege-hameau",
    name: "Nadège Hameau",
    type: "exposition",
    title: "Marqueur acrylique",
    description: "Des mondes imaginaires prennent forme au marqueur acrylique, dans un style mêlant pointillisme, précision et rêverie. Autodidacte, Nadhame.artiste, alias Nadège Hameau, cultive une démarche empreinte de patience et de poésie visuelle.",
    time: "10:00-18:00",
    location: "10 quai Turenne / 13 rue Kervégan",
    locationId: "quai-turenne-10",
    space: "Moitié cour coté ouest + hall rue Kervégan",
    days: ["samedi", "dimanche"],
    bio: "Artiste autodidacte",
    contact: "nadhame.artiste@gmail.com",
    instagram: "www.instagram.com/nadhame.artiste"
  },
  {
    id: "pauline-crusson",
    name: "Pauline Crusson",
    type: "exposition",
    title: "PaoaNaoned",
    description: "Revisitant les cartes postales du vieux Nantes avec un style unique et détaillé, Pauline Crusson sous le nom de PaoaNaoned, redonne vie à ces images anciennes. Elle capture ainsi l'essence de la ville à travers ses dessins.",
    time: "10:00-18:00",
    location: "10 quai Turenne / 13 rue Kervégan",
    locationId: "quai-turenne-10",
    space: "Hall rue Kervégan",
    days: ["samedi", "dimanche"],
    bio: "Illustratrice nantaise",
    contact: "pauline.elisabeth.crusson@gmail.com",
    instagram: "www.instagram.com/paoanaoned"
  },

  // 17 rue Kervégan / 11 quai Turenne
  {
    id: "marie-husson",
    name: "Marie Husson",
    type: "exposition",
    title: "Dessins et peintures",
    description: "Explorant des instants d'intimité à la lisière du visible, Marie Husson archive ses découvertes sous forme de dessins et peintures mêlant aquarelle, encre, broderie ou huile. Sa pratique, expérimentale et sensible, donne naissance à des images profondes, fragiles et puissamment poétiques.",
    time: "10:00-18:00",
    location: "17 rue Kervégan / 11 quai Turenne",
    locationId: "rue-kervegan-17",
    space: "Couloir et cour",
    days: ["samedi", "dimanche"],
    bio: "Artiste peintre et dessinatrice",
    contact: "contact@mariehusson.art",
    instagram: "www.instagram.com/marie.husson.art"
  },

  // 11 allée Duguay Trouin / 20 rue Kervégan
  {
    id: "clotilde-debar-zablocki",
    name: "Clotilde Debar Zablocki",
    type: "exposition",
    title: "apolline.design",
    description: "Inspirée par l'histoire et le patrimoine local, notamment celui d'Anne de Bretagne, Clotilde Debar-Zablocki crée un univers poétique et sensible. Avec David, elle forme le duo apolline.design, spécialisé en fresques décoratives et patines.",
    time: "10:00-18:00",
    location: "11 allée Duguay Trouin / 20 rue Kervégan",
    locationId: "allee-duguay-trouin-11",
    space: "Cour",
    days: ["samedi", "dimanche"],
    bio: "Artiste et décoratrice",
    contact: "apollinedesign@gmail.com",
    instagram: "www.instagram.com/apolline.design"
  },
  {
    id: "malou-tual",
    name: "Malou Tual",
    type: "exposition",
    title: "Peinture et sculpture sur bois",
    description: "Artiste peintre et sculptrice sur bois, Malou Tual crée des œuvres uniques autour de masques ethniques et de mandalas émotionnels. Ses sculptures, façonnées à la main, allient sensibilité et tradition dans une démarche artisanale profonde.",
    time: "10:00-18:00",
    location: "11 allée Duguay Trouin / 20 rue Kervégan",
    locationId: "allee-duguay-trouin-11",
    space: "Cour",
    days: ["samedi", "dimanche"],
    bio: "Artiste peintre et sculptrice sur bois",
    contact: "tual.malou@gmail.com",
    instagram: "www.instagram.com/l_ame_agit_dans_les_mains"
  },
  {
    id: "gael-caudoux",
    name: "Gaël Caudoux",
    type: "exposition",
    title: "Cartographies imaginaires",
    description: "Vastes cartographies de territoires imaginaires, riches en détails et en narration, Gaël Caudoux les réalise à la main depuis l'enfance. Ses grands formats, en constante évolution, invitent à la découverte d'un univers unique et fascinant.",
    time: "10:00-18:00",
    location: "11 allée Duguay Trouin / 20 rue Kervégan",
    locationId: "allee-duguay-trouin-11",
    space: "Cour",
    days: ["samedi", "dimanche"],
    bio: "Artiste cartographe",
    contact: "gael.caudoux.art@gmail.com",
    instagram: "www.instagram.com/gaelcaudoux.imaginarium"
  },

  // 16 allée Duguay Trouin
  {
    id: "atelier-norg",
    name: "Atelier Norg",
    type: "exposition",
    title: "Peinture, sculpture et dessin",
    description: "Norg est un plasticien basé à Nantes dont le travail navigue entre peinture, sculpture et dessin, avec une énergie brute et expressive. Son univers visuel est direct et instinctif.",
    time: "10:00-18:00",
    location: "16 allée Duguay Trouin",
    locationId: "allee-duguay-trouin-16",
    space: "Cour et hall",
    days: ["samedi", "dimanche"],
    bio: "Plasticien nantais",
    contact: "atelier.norg@gmail.com",
    instagram: "www.instagram.com/ateliernorg"
  },
  {
    id: "jerome-luneau",
    name: "Jérôme Luneau",
    type: "exposition",
    title: "Chun Yong Ho",
    description: "Chun Yong Ho, artiste peintre originaire de Corée du Sud, explore l'abstraction à travers des jeux de couleurs et de lignes évoquant des paysages mentaux. Son travail invite à un voyage intérieur, entre sensations et émotions.",
    time: "10:00-18:00",
    location: "16 allée Duguay Trouin",
    locationId: "allee-duguay-trouin-16",
    space: "Cour et hall",
    days: ["samedi", "dimanche"],
    bio: "Artiste peintre originaire de Corée du Sud",
    contact: "yongho@hotmail.fr",
    instagram: "www.instagram.com/yonghochun"
  }
];
