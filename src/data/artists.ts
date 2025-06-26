// Artists data for exhibitions and concerts
export type Artist = {
  id: string;
  name: string;
  type: "exposition" | "concert";
  title: string;
  bio: string;
  instagram?: string;
  image?: string;
  // Nouveaux champs pour les concerts
  email?: string;
  photos?: string[];
  presentation?: string;
  link?: string;
  website?: string;
  facebook?: string;
  phone?: string;
  director?: string;
  members?: string; // Liste des membres pour les groupes/ensembles
};

export const artists: Artist[] = [
  // Artistes d'exposition
  {
    id: "bruno-barbier",
    name: "Bruno Barbier",
    type: "exposition",
    title: "Peintures et dessins",
    bio: "Artiste peintre et dessinateur installé à Nantes, explorant les thèmes du souvenir et de la nostalgie, Bruno Barbier, artiste peintre et dessinateur installé à Nantes, évoque des fragments de mémoire, entre émotions passées et traces du temps.",
    instagram: "https://www.instagram.com/brunobarbierpainter"
  },
  {
    id: "alain-gremillet",
    name: "Alain Gremillet",
    type: "exposition",
    title: "Peinture abstraite",
    bio: "Artiste peintre abstrait, associant couleurs, mouvements et lumière pour susciter l'émotion, l'artiste peintre abstrait Alain Gremillet explore librement la matière avec acrylique, spatules et objets du quotidien, donnant naissance à des œuvres uniques et lumineuses.",
    instagram: "https://www.instagram.com/alaingremillet"
  },
  {
    id: "jerome-gourdon",
    name: "Jérôme Gourdon",
    type: "exposition",
    title: "Photo-émographie",
    bio: "Photo-émographe, mêlant photographie, intervention in-situ et peinture acrylique, Jérôme Gourdon se définit comme un photo-émographe. Son travail explore les frontières entre image captée et image transformée, pour créer des œuvres à la croisée des médiums.",
    instagram: "https://www.instagram.com/jerome_gourdon"
  },
  {
    id: "nadege-hameau",
    name: "Nadège Hameau",
    type: "exposition",
    title: "Marqueur acrylique",
    bio: "Artiste autodidacte. Des mondes imaginaires prennent forme au marqueur acrylique, dans un style mêlant pointillisme, précision et rêverie. Autodidacte, Nadhame.artiste, alias Nadège Hameau, cultive une démarche empreinte de patience et de poésie visuelle.",
    instagram: "https://www.instagram.com/nadhame.artiste"
  },
  {
    id: "pauline-crusson",
    name: "Pauline Crusson",
    type: "exposition",
    title: "PaoaNaoned",
    bio: "Illustratrice nantaise. Revisitant les cartes postales du vieux Nantes avec un style unique et détaillé, Pauline Crusson sous le nom de PaoaNaoned, redonne vie à ces images anciennes. Elle capture ainsi l'essence de la ville à travers ses dessins.",
    instagram: "https://www.instagram.com/paoanaoned"
  },
  {
    id: "marie-husson",
    name: "Marie Husson",
    type: "exposition",
    title: "Dessins et peintures",
    bio: "Artiste peintre et dessinatrice. Explorant des instants d'intimité à la lisière du visible, Marie Husson archive ses découvertes sous forme de dessins et peintures mêlant aquarelle, encre, broderie ou huile. Sa pratique, expérimentale et sensible, donne naissance à des images profondes, fragiles et puissamment poétiques.",
    instagram: "https://www.instagram.com/marie.husson.art"
  },
  {
    id: "clotilde-debar-zablocki",
    name: "Clotilde Debar Zablocki",
    type: "exposition",
    title: "apolline.design",
    bio: "Artiste et décoratrice. Inspirée par l'histoire et le patrimoine local, notamment celui d'Anne de Bretagne, Clotilde Debar-Zablocki crée un univers poétique et sensible. Avec David, elle forme le duo apolline.design, spécialisé en fresques décoratives et patines.",
    instagram: "https://www.instagram.com/apolline.design"
  },
  {
    id: "malou-tual",
    name: "Malou Tual",
    type: "exposition",
    title: "Peinture et sculpture sur bois",
    bio: "Artiste peintre et sculptrice sur bois. Malou Tual crée des œuvres uniques autour de masques ethniques et de mandalas émotionnels. Ses sculptures, façonnées à la main, allient sensibilité et tradition dans une démarche artisanale profonde.",
    instagram: "https://www.instagram.com/l_ame_agit_dans_les_mains"
  },
  {
    id: "gael-caudoux",
    name: "Gaël Caudoux",
    type: "exposition",
    title: "Cartographies imaginaires",
    bio: "Artiste cartographe. Vastes cartographies de territoires imaginaires, riches en détails et en narration, Gaël Caudoux les réalise à la main depuis l'enfance. Ses grands formats, en constante évolution, invitent à la découverte d'un univers unique et fascinant.",
    instagram: "https://www.instagram.com/gaelcaudoux.imaginarium"
  },
  {
    id: "atelier-norg",
    name: "Atelier Norg",
    type: "exposition",
    title: "Peinture, sculpture et dessin",
    bio: "Plasticien nantais. Norg est un plasticien basé à Nantes dont le travail navigue entre peinture, sculpture et dessin, avec une énergie brute et expressive. Son univers visuel est direct et instinctif.",
    instagram: "https://www.instagram.com/ateliernorg"
  },
  {
    id: "jerome-luneau",
    name: "Jérôme Luneau",
    type: "exposition",
    title: "Chun Yong Ho",
    bio: "Chun Yong Ho, artiste peintre originaire de Corée du Sud, explore l'abstraction à travers des jeux de couleurs et de lignes évoquant des paysages mentaux. Son travail invite à un voyage intérieur, entre sensations et émotions.",
    instagram: "https://www.instagram.com/yonghochun"
  },
  {
    id: "andry-shango-rajoelina",
    name: "Andry Shango Rajoelina",
    type: "exposition",
    title: "Art multidisciplinaire",
    bio: "Artiste multidisciplinaire mêlant peinture, design et art textile, Andry \"Shango\" Rajoelina explore les identités africaines à travers une esthétique vibrante et contemporaine. Son univers visuel, riche en symboles et en couleurs, reflète un profond engagement culturel et narratif.",
    instagram: "https://www.instagram.com/andryshango",
    email: "rajoelina.a@gmail.com"
  },
  {
    id: "expo9", // This was 'Jocelyn Prouff (Joss Proof)' in events.ts but ID was 'expo9' in artistsData
    name: "Jocelyn Prouff (Joss Proof)",
    type: "exposition",
    title: "Carnets Nantais",
    bio: "Croquant in situ des lieux urbains où la nature reprend ses droits, avec une attention particulière à la lumière et aux détails, Joss Proof invite à un autre regard sur la ville à travers ses carnets sensibles. Il partage cet univers dans son livre \"Carnets Nantais\".",
    instagram: "https://www.instagram.com/joss_proof"
  },
  // Artistes de la Maison Collective (from artistsData.ts)
  {
    id: "emmanuelle-boisson",
    name: "Emmanuelle Boisson (Manoukidessine)",
    type: "exposition",
    title: "Illustrations et Carnets",
    bio: "Portée par le désir de raconter des histoires en images, Manoukidessine explore avec tendresse les émotions, le quotidien et l'imaginaire. Elle partage son univers à travers dessins, carnets et albums jeunesse.",
    instagram: "https://www.instagram.com/manoukidessine"
  },
  {
    id: "catherine-clement",
    name: "Catherine Clément (Kat Klementi)",
    type: "exposition",
    title: "Les Petits Formats",
    bio: "Depuis 2018, je développe une série de petits formats réalisés à partir de cadres anciens chinés. Ces œuvres sont à la croisée d'une recherche esthétique et d'une narration silencieuse. Le cadre, loin d'être un simple ornement : « Le choix des cadres est essentiel. Ils doivent dialoguer avec l'œuvre, la compléter, la renforcer. Ce ne sont pas de simples éléments décoratifs : ils soulignent le sujet et rendent chaque tableau unique. » Les petits formats représentent des personnages, des objets isolés, des intérieurs... toujours cadrés au plus proche. Le regard oscille entre micro-natures mortes, mini-portraits et scènes intimistes. « Jouer avec les échelles oblige le spectateur à regarder de plus près, à observer avec attention. » Isoler un objet de son contexte lui donne une nouvelle présence, une intensité singulière « Ce n'est plus un simple objet du quotidien, mais un élément qui appelle à l'introspection. J'insiste sur l'individualité dans chacune de mes compositions. » Les rayures sont un motif récurrent dans mes peintures, les rayures instaurent un rythme visuel qui attire l'œil et structure l'espace. « Les rayures apportent une harmonie, un équilibre. Elles unifient l'ensemble des peintures et permettent aux sujets de s'inscrire dans un décor cohérent. »",
    instagram: "https://www.instagram.com/katklementi"
  },
  {
    id: "mostapha-rouine",
    name: "Mostapha Rouine",
    type: "exposition",
    title: "Entre Bretagne et Maroc",
    bio: "Puisant son inspiration entre la Bretagne et le Maroc, entre pêche à pied et scènes de vie quotidienne, Mostapha Rouine crée avec aquarelles, brou de noix et huiles. L'artiste peintre autodidacte fait vibrer la lumière, l'ambiance et les couleurs de ces deux mondes.",
    instagram: "https://www.instagram.com/mostapharouine"
  },
  // Concerts (from artistsData.ts)
  {
    id: "nota-bene",
    name: "Nota Bene",
    type: "concert",
    title: "Choeur de femmes Nota Bene",
    bio: "",
    email: "contact@notabene.fr",
    instagram: ""
  },
  {
    id: "philippe-peaud",
    name: "Philippe Peaud",
    type: "concert",
    title: "Conteurs",
    bio: "",
    email: "contact@conteurs.fr",
    instagram: ""
  },
  {
    id: "les-scarabees-rodent",
    name: "Les Scarabées Rôdent",
    type: "concert",
    title: "Les Scarabées Rôdent",
    bio: "",
    email: "contact@scarabees.fr",
    instagram: ""
  },
  {
    id: "aperto",
    name: "Aperto !",
    type: "concert",
    title: "Aperto !",
    bio: "Flûtes traversières du Conservatoire de Nantes. Direction : Gilles de Talhouët",
    email: "contact@aperto.fr",
    instagram: "",
    presentation: "Allegro aperto est le titre du premier mouvement d'un concerto pour flûte de Mozart.\n\nLe mot Aperto signifie « ouvert » en italien.\n\nL'ensemble est ouvert à tou.te.s les flûtistes : élèves du conservatoire, anciens élèves, amateurs et musiciens professionnels.\n\nIl est également ouvert à toutes les musiques :\n\n- musique classique : de Bach à Bartok\n- musiques du monde : Irlande (reels et jigs), Europe centrale (klezmer), Espagne (sardanes), Brésil (choros), Grèce (kalamatianos), etc.\n- chansons populaires : Beatles, Simon & Garfunkel, comédies musicales, films Disney, etc.",
    link: "https://youtu.be/aKxyrWCofOI",
    photos: [
      "/concerts/Aperto/Aperto1.jpg",
      "/concerts/Aperto/Aperto2.jpg"
    ]
  },
  {
    id: "quatuor-liger",
    name: "Quatuor Liger",
    type: "concert",
    title: "Quatuor Liger",
    bio: "Quatuor à cordes formé en 1995 à Nantes",
    members: "Patrick Févai, Solenne Guilbert, Gwenola Morin, Cédric Forré",
    instagram: "",
    email: "solenne.guilbert@quatuorliger.fr",
    presentation: "Le Quatuor Liger est un quatuor à cordes formé en 1995 à Nantes, et qui a évolué ces dernières années avec de nouveaux membres."
    +"Composé de quatre musiciens passionnés (Patrick Févai, Solenne Guilbert, Gwenola Morin, Cédric Forré), le quatuor propose un répertoire varié"
    +" allant de la musique classique aux arrangements contemporains. Leur interprétation sensible et dynamique offre une expérience musicale unique."
    +"\n\n---\n\n## PROGRAMME\n\n### Wolfgang Mozart (1756-1791)\n**Quatuor n°17 \"La chasse\" - 25 min**\n\nLe quatuor n°17 en si bémol majeur, surnommé "
    +"\"La Chasse\", fait partie des six quatuors dédiés à Haydn par Mozart. Composé en 1784, il doit son surnom à son premier mouvement, dont le caractère "
    +"rythmé et léger rappelle une scène de chasse. L'œuvre est pleine de vitalité et de charme, témoignant de l'amitié et de l'admiration de Mozart pour Haydn."
    +"\n\n### Franz Schubert (1797-1828)\n**Quatuor n°10 - 25 min**\n\nLe quatuor à cordes n°10 en mi bémol majeur de Schubert, également appelé \"Quatuor jeunesse\", "
    +"a été écrit en 1813 alors que le compositeur n'avait que 16 ans. Malgré son jeune âge, cette œuvre révèle déjà une grande maîtrise de la forme et une sensibilité "
    +"profonde. Moins dramatique que ses œuvres ultérieures, le quatuor se distingue par sa fraîcheur mélodique et son atmosphère paisible."
    +"\n\n---\n\nMozart et Schubert ont été au cœur de l'évolution du quatuor à cordes, garants d'une transmission et créateurs de génie. Ces deux quatuors, de périodes"
    +" et de styles différents, sont des témoignages brillants du génie de leurs compositeurs respectifs, et contiennent à la fois ce classicisme et cette révolution qui"
    +" s'est opérée en 30 ans.\n\nLe Quatuor Liger interprète ces compositeurs viennois du tournant des XVIIIe et XIXe siècle sur des instruments historiques (cordes en boyaux, archets classiques).",
    link: "",
    photos: [
      "/concerts/QuatuorLiger/quatuor-liger-1.jpg",
      "/concerts/QuatuorLiger/quatuor-liger-2.jpg"
    ]
  },
  {
    id: "eva",
    name: "L'Ensemble Vocal EVA",
    type: "concert",
    title: "L'Ensemble Vocal EVA",
    bio: "L'Ensemble Vocal EVA, dirigé depuis 2023 par Pascale GARCIA, fait le choix d'un répertoire ouvert sur différentes époques, incluant des œuvres profanes ou sacrées, peu connues ou inédites. L'Ensemble Vocal EVA propose des créations de compositeurs emblématiques des XXe et XXIe siècles, qui savent magnifier des textes poétiques ou bibliques, chantés à 3, 4, 5 ou même 6 voix, a cappella ou accompagnés d'instruments.",
    website: "https://www.choeureva.fr",
    facebook: "EVA-choeur de femmes",
    phone: "06 87 08 63 84",
    director: "Pascale Garcia",
    email: "contact@choeureva.fr",
    instagram: ""

  },
  {
    id: "swing-it",
    name: "Swing it !",
    type: "concert",
    title: "Swing it !",
    bio: "",
    email: "contact@swingit.fr",
    instagram: ""
  },
  {
    id: "variabilis",
    name: "Variabilis",
    type: "concert",
    title: "Variabilis",
    bio: "",
    email: "contact@variabilis.fr",
    instagram: ""
  },
  {
    id: "elizaveta-vojnovich",
    name: "Elizaveta Vojnovich",
    type: "exposition",
    title: "Peinture",
    bio: "Artiste peintre aux inspirations variées",
    email: "vojnovich@yandex.com",
    instagram: "https://www.instagram.com/elizaveta.vojnovich"
  },
  {
    id: "fabienne-choyau",
    name: "Fabienne Choyau",
    type: "exposition",
    title: "Peinture contemporaine",
    bio: "Artiste peintre contemporaine explorant les couleurs et les formes",
    email: "fabienne.choyau@laposte.net",
    instagram: "https://www.instagram.com/fabienne.choyau.art"
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
