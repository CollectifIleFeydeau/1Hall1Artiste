// Artists data for exhibitions and concerts
export type Artist = {
  id: string;
  name: string;
  type: "exposition" | "concert";
  title: string;
  description: string;
  bio: string;
  contact: string;
  instagram?: string;
  image?: string;
};

export const artists: Artist[] = [
  // Artistes d'exposition
  {
    id: "bruno-barbier",
    name: "Bruno Barbier",
    type: "exposition",
    title: "Peintures et dessins",
    description: "Explorant les thèmes du souvenir et de la nostalgie, Bruno Barbier, artiste peintre et dessinateur installé à Nantes, évoque des fragments de mémoire, entre émotions passées et traces du temps.",
    bio: "Artiste peintre et dessinateur installé à Nantes",
    contact: "https://www.instagram.com/brunobarbierpainter",
    instagram: "https://www.instagram.com/brunobarbierpainter"
  },
  {
    id: "alain-gremillet",
    name: "Alain Gremillet",
    type: "exposition",
    title: "Peinture abstraite",
    description: "Associant couleurs, mouvements et lumière pour susciter l'émotion, l'artiste peintre abstrait Alain Gremillet explore librement la matière avec acrylique, spatules et objets du quotidien, donnant naissance à des œuvres uniques et lumineuses.",
    bio: "Artiste peintre abstrait",
    contact: "https://www.instagram.com/alaingremillet",
    instagram: "https://www.instagram.com/alaingremillet"
  },
  {
    id: "jerome-gourdon",
    name: "Jérôme Gourdon",
    type: "exposition",
    title: "Photo-émographie",
    description: "Mêlant photographie, intervention in-situ et peinture acrylique, Jérôme Gourdon se définit comme un photo-émographe. Son travail explore les frontières entre image captée et image transformée, pour créer des œuvres à la croisée des médiums.",
    bio: "Photo-émographe",
    contact: "https://www.instagram.com/jerome_gourdon",
    instagram: "https://www.instagram.com/jerome_gourdon"
  },
  {
    id: "nadege-hameau",
    name: "Nadège Hameau",
    type: "exposition",
    title: "Marqueur acrylique",
    description: "Des mondes imaginaires prennent forme au marqueur acrylique, dans un style mêlant pointillisme, précision et rêverie. Autodidacte, Nadhame.artiste, alias Nadège Hameau, cultive une démarche empreinte de patience et de poésie visuelle.",
    bio: "Artiste autodidacte",
    contact: "https://www.instagram.com/nadhame.artiste",
    instagram: "https://www.instagram.com/nadhame.artiste"
  },
  {
    id: "pauline-crusson",
    name: "Pauline Crusson",
    type: "exposition",
    title: "PaoaNaoned",
    description: "Revisitant les cartes postales du vieux Nantes avec un style unique et détaillé, Pauline Crusson sous le nom de PaoaNaoned, redonne vie à ces images anciennes. Elle capture ainsi l'essence de la ville à travers ses dessins.",
    bio: "Illustratrice nantaise",
    contact: "https://www.instagram.com/paoanaoned",
    instagram: "https://www.instagram.com/paoanaoned"
  },
  {
    id: "marie-husson",
    name: "Marie Husson",
    type: "exposition",
    title: "Dessins et peintures",
    description: "Explorant des instants d'intimité à la lisière du visible, Marie Husson archive ses découvertes sous forme de dessins et peintures mêlant aquarelle, encre, broderie ou huile. Sa pratique, expérimentale et sensible, donne naissance à des images profondes, fragiles et puissamment poétiques.",
    bio: "Artiste peintre et dessinatrice",
    contact: "https://www.instagram.com/marie.husson.art",
    instagram: "https://www.instagram.com/marie.husson.art"
  },
  {
    id: "clotilde-debar-zablocki",
    name: "Clotilde Debar Zablocki",
    type: "exposition",
    title: "apolline.design",
    description: "Inspirée par l'histoire et le patrimoine local, notamment celui d'Anne de Bretagne, Clotilde Debar-Zablocki crée un univers poétique et sensible. Avec David, elle forme le duo apolline.design, spécialisé en fresques décoratives et patines.",
    bio: "Artiste et décoratrice",
    contact: "https://www.instagram.com/apolline.design",
    instagram: "https://www.instagram.com/apolline.design"
  },
  {
    id: "malou-tual",
    name: "Malou Tual",
    type: "exposition",
    title: "Peinture et sculpture sur bois",
    description: "Artiste peintre et sculptrice sur bois, Malou Tual crée des œuvres uniques autour de masques ethniques et de mandalas émotionnels. Ses sculptures, façonnées à la main, allient sensibilité et tradition dans une démarche artisanale profonde.",
    bio: "Artiste peintre et sculptrice sur bois",
    contact: "https://www.instagram.com/l_ame_agit_dans_les_mains",
    instagram: "https://www.instagram.com/l_ame_agit_dans_les_mains"
  },
  {
    id: "gael-caudoux",
    name: "Gaël Caudoux",
    type: "exposition",
    title: "Cartographies imaginaires",
    description: "Vastes cartographies de territoires imaginaires, riches en détails et en narration, Gaël Caudoux les réalise à la main depuis l'enfance. Ses grands formats, en constante évolution, invitent à la découverte d'un univers unique et fascinant.",
    bio: "Artiste cartographe",
    contact: "https://www.instagram.com/gaelcaudoux.imaginarium",
    instagram: "https://www.instagram.com/gaelcaudoux.imaginarium"
  },
  {
    id: "atelier-norg",
    name: "Atelier Norg",
    type: "exposition",
    title: "Peinture, sculpture et dessin",
    description: "Norg est un plasticien basé à Nantes dont le travail navigue entre peinture, sculpture et dessin, avec une énergie brute et expressive. Son univers visuel est direct et instinctif.",
    bio: "Plasticien nantais",
    contact: "https://www.instagram.com/ateliernorg",
    instagram: "https://www.instagram.com/ateliernorg"
  },
  {
    id: "jerome-luneau",
    name: "Jérôme Luneau",
    type: "exposition",
    title: "Chun Yong Ho",
    description: "Chun Yong Ho, artiste peintre originaire de Corée du Sud, explore l'abstraction à travers des jeux de couleurs et de lignes évoquant des paysages mentaux. Son travail invite à un voyage intérieur, entre sensations et émotions.",
    bio: "Artiste peintre originaire de Corée du Sud",
    contact: "https://www.instagram.com/yonghochun",
    instagram: "https://www.instagram.com/yonghochun"
  },
  {
    id: "expo9", // This was 'Jocelyn Prouff (Joss Proof)' in events.ts but ID was 'expo9' in artistsData
    name: "Jocelyn Prouff (Joss Proof)",
    type: "exposition",
    title: "Carnets Nantais",
    description: "Croquant in situ des lieux urbains où la nature reprend ses droits, avec une attention particulière à la lumière et aux détails, Joss Proof invite à un autre regard sur la ville à travers ses carnets sensibles. Il partage cet univers dans son livre \"Carnets Nantais\".",
    bio: "Croquant in situ des lieux urbains où la nature reprend ses droits, avec une attention particulière à la lumière et aux détails, Joss Proof invite à un autre regard sur la ville à travers ses carnets sensibles. Il partage cet univers dans son livre \"Carnets Nantais\".",
    contact: "https://www.instagram.com/joss_proof",
    instagram: "https://www.instagram.com/joss_proof"
  },
  // Artistes de la Maison Collective (from artistsData.ts)
  {
    id: "emmanuelle-boisson",
    name: "Emmanuelle Boisson (Manoukidessine)",
    type: "exposition",
    title: "Illustrations et Carnets",
    description: "Portée par le désir de raconter des histoires en images, Manoukidessine explore avec tendresse les émotions, le quotidien et l'imaginaire. Elle partage son univers à travers dessins, carnets et albums jeunesse.",
    bio: "Portée par le désir de raconter des histoires en images, Manoukidessine explore avec tendresse les émotions, le quotidien et l'imaginaire. Elle partage son univers à travers dessins, carnets et albums jeunesse.",
    contact: "https://www.instagram.com/manoukidessine",
    instagram: "https://www.instagram.com/manoukidessine"
  },
  {
    id: "catherine-clement",
    name: "Catherine Clément (Kat Klementi)",
    type: "exposition",
    title: "Peintures en Miniature",
    description: "Dans de petits cadres anciens, l'intimité du format rencontre le charme du passé pour accueillir des créations délicates et contemporaines. Kat Klementi y déploie une peinture sensible, empreinte de douceur et de poésie.",
    bio: "Dans de petits cadres anciens, l'intimité du format rencontre le charme du passé pour accueillir des créations délicates et contemporaines. Kat Klementi y déploie une peinture sensible, empreinte de douceur et de poésie.",
    contact: "https://www.instagram.com/katklementi",
    instagram: "https://www.instagram.com/katklementi"
  },
  {
    id: "mostapha-rouine",
    name: "Mostapha Rouine",
    type: "exposition",
    title: "Entre Bretagne et Maroc",
    description: "Puisant son inspiration entre la Bretagne et le Maroc, entre pêche à pied et scènes de vie quotidienne, Mostapha Rouine crée avec aquarelles, brou de noix et huiles. L'artiste peintre autodidacte fait vibrer la lumière, l'ambiance et les couleurs de ces deux mondes.",
    bio: "Puisant son inspiration entre la Bretagne et le Maroc, entre pêche à pied et scènes de vie quotidienne, Mostapha Rouine crée avec aquarelles, brou de noix et huiles. L'artiste peintre autodidacte fait vibrer la lumière, l'ambiance et les couleurs de ces deux mondes.",
    contact: "https://www.instagram.com/mostapharouine",
    instagram: "https://www.instagram.com/mostapharouine"
  },
  // Concerts (from artistsData.ts)
  {
    id: "nota-bene",
    name: "Nota Bene",
    type: "concert",
    title: "Choeur de femmes Nota Bene",
    description: "Choeur de femmes Nota Bene en concert",
    bio: "Choeur de femmes Nota Bene",
    contact: "contact@notabene.fr",
    instagram: ""
  },
  {
    id: "philippe-peaud",
    name: "Philippe Peaud",
    type: "concert",
    title: "Conteurs",
    description: "Séance de contes avec Philippe Peaud",
    bio: "Philippe Peaud",
    contact: "contact@conteurs.fr",
    instagram: ""
  },
  {
    id: "les-scarabees-rodent",
    name: "Les Scarabées Rôdent",
    type: "concert",
    title: "Les Scarabées Rôdent",
    description: "Concert du groupe Les Scarabées Rôdent",
    bio: "Les Scarabées Rôdent",
    contact: "contact@scarabees.fr",
    instagram: ""
  },
  {
    id: "aperto",
    name: "Aperto !",
    type: "concert",
    title: "Aperto !",
    description: "Concert du groupe Aperto !",
    bio: "Aperto !",
    contact: "contact@aperto.fr",
    instagram: ""
  },
  {
    id: "quatuor-liger",
    name: "Quatuor Liger",
    type: "concert",
    title: "Quatuor Liger",
    description: "Concert du Quatuor Liger",
    bio: "Quatuor Liger",
    contact: "contact@quatuorliger.fr",
    instagram: ""
  },
  {
    id: "eva",
    name: "EVA",
    type: "concert",
    title: "EVA choeur de femmes",
    description: "Concert du choeur de femmes EVA",
    bio: "EVA choeur de femmes",
    contact: "contact@eva-choeur.fr",
    instagram: ""
  },
  {
    id: "swing-it",
    name: "Swing it !",
    type: "concert",
    title: "Swing it !",
    description: "Concert du groupe Swing it !",
    bio: "Swing it !",
    contact: "contact@swingit.fr",
    instagram: ""
  },
  {
    id: "variabilis",
    name: "Variabilis",
    type: "concert",
    title: "Variabilis",
    description: "Concert de Variabilis",
    bio: "Variabilis",
    contact: "contact@variabilis.fr",
    instagram: ""
  }
  // Ajouter d'autres artistes au besoin
];

// Fonctions utilitaires
export function getArtistById(id: string): Artist | undefined {
  return artists.find(artist => artist.id === id);
}

export function getAllArtists(): Artist[] {
  return artists;
}

export function getArtistsByType(type: "exposition" | "concert"): Artist[] {
  return artists.filter(artist => artist.type === type);
}
