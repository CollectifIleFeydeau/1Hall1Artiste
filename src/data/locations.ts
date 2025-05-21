
// Locations data for the map
export type Location = {
  id: string;
  name: string;
  x: number;
  y: number;
  description: string;
  history?: string; // Historique complet du lieu
  image?: string; // URL de l'image du lieu
  events: string[];
  visited?: boolean;
};

export const locations: Location[] = [
  {
    id: "quai-turenne-8",
    name: "8 quai Turenne",
    x: 260,
    y: 108,
    description: "Bâtiment historique du XVIIIe siècle situé au 8 allée Turenne/9 rue Kervégan. Construit en 1753 pour Jacques Berouette, négociant et actionnaire d'origine du lotissement de l'Île Feydeau. L'immeuble présente des façades richement décorées avec des mascarons à thèmes marins. Les façades et la cage d'escalier sont inscrites aux monuments historiques depuis 1984.",
    image: "/8 quai Turenne.jpg",
    history: "Habité par un des actionnaires d'origine\n\nJacques Berouette, négociant et avocat du roi est l'un des actionnaires d'origine de la compagnie créée pour construire le lotissement. En 1753, il habite sa nouvelle maison de l'Île Feydeau.\n\nLe bâti\n\nLes deux façades de l'immeuble ont beaucoup de points communs avec le 15, allée Duguay-Trouin/28, rue Kervégan. Celle côté quai est plus richement décorée. Les mascarons traitent de thèmes marins. Contrairement à beaucoup d'immeubles pour lesquels l'escalier est situé dans une tourelle, il a été choisi ici de l'intégrer au bâti. \nIl donne sur chacun des couloirs d'entrée. Le mur-noyau en est ajouré pour donner plus de clarté. Le balcon du 1er étage est monté sur des consoles, celui du 2ème en encorbellement sur une Trompe.\n\nLes matériaux\n\nLa partie basse du rez-de-chaussée est construite en granite alors que la partie haute et notamment les mascarons sont en calcaire de Saint-Savinien (Charente maritime), une pierre semi-dure. Les étages sont construits en tuffeau de la région de Saumur.\n\nUn immeuble inscrit\n\nEn 1933, les deux immeubles ont été séparés. La restauration de chacun a été effectuée à quelques années d'intervalle. Les façades sur rue et sur cour ainsi que la cage d'escalier ont été inscrits à l'inventaire supplémentaire des monuments historiques le 5 décembre 1984.",
    events: ["expo3", "expo5", "expo7", "expo9"],
    visited: false
  },
  {
    id: "quai-turenne-9",
    name: "09 quai Turenne / 11 rue Kervégan",
    x: 260,
    y: 150,
    description: "Immeuble dit à la 'Cour Ovale' (1756). Construit par Joseph Raimbaud, marchand de bois, avec une cour commune rectangulaire à pans coupés. Décors caractéristiques: mascarons et ferronneries. Double accès côté quai et rue. Monument Historique depuis 1984.",
    image: "/9 quai Turenne.jpg",
    history: "Immeuble dit à la \"Cour Ovale\"\nEn 1756, Joseph Raimbaud (marchand de bois) acquiert sur l'île Feydeau, deux terrains contigus et y fait édifier deux immeubles avec une cour commune, vaste cour rectangulaire à pans coupés, la \"Cour ovale\". Les deux immeubles aux décors caractéristiques du milieu du siècle (mascarons et ferronneries) ont un double accès, côté quai et côté rue. Les deux façades sur quai sont traitées de manière identique et en symétrie, les 12 travées étant groupées deux par deux. Les façades sur rue sont moins ostentatoires, les quatre doubles travées de gauche n'ont reçu qu'un seul étage, le programme architectural n'ayant pas été achevé. Immeuble classé au titre des Monuments Historiques depuis 1984.",
    events: ["bruno-barbier"],
    visited: false
  },
  {
    id: "quai-turenne-9-concert",
    name: "09 quai Turenne / 11 rue Kervégan",
    x: 260,
    y: 180,
    description: "Immeuble dit à la 'Cour Ovale' (1756). Construit par Joseph Raimbaud, marchand de bois, avec une cour commune rectangulaire à pans coupés. Décors caractéristiques: mascarons et ferronneries. Double accès côté quai et rue. Monument Historique depuis 1984.",
    image: "/9 quai Turenne.jpg",
    history: "Immeuble dit à la \"Cour Ovale\"\nEn 1756, Joseph Raimbaud (marchand de bois) acquiert sur l'île Feydeau, deux terrains contigus et y fait édifier deux immeubles avec une cour commune, vaste cour rectangulaire à pans coupés, la \"Cour ovale\". Les deux immeubles aux décors caractéristiques du milieu du siècle (mascarons et ferronneries) ont un double accès, côté quai et côté rue. Les deux façades sur quai sont traitées de manière identique et en symétrie, les 12 travées étant groupées deux par deux. Les façades sur rue sont moins ostentatoires, les quatre doubles travées de gauche n'ont reçu qu'un seul étage, le programme architectural n'ayant pas été achevé. Immeuble classé au titre des Monuments Historiques depuis 1984.",
    events: ["concert-nota-bene", "concert-conteurs-samedi", "concert-scarabees", "concert-aperto", "concert-quatuor-liger", "concert-eva", "concert-conteurs-dimanche", "concert-swing-it", "concert-variabilis"],
    visited: false
  },
  {
    id: "quai-turenne-10",
    name: "10 quai Turenne / 13 rue Kervégan",
    x: 260,
    y: 224,
    description: "Immeuble de négociant (1755-56). Construit par Joseph Raimbaud, marchand de bois. Innovation architecturale: premier immeuble de Feydeau avec des appartements à couloir plutôt qu'en enfilade. 3 étages et combles sans entresol. Inscrit aux Monuments Historiques depuis 1984.",
    image: "/10 quai Turenne.jpg",
    history: "Un immeuble de négociant\n\nJacques Goubert, ingénieur, est un des actionnaires d'origine du lotissement. Il est l'auteur des plans du parcellaire. Il propose également dans son projet un modèle d'élévation qui ne sera pas suivi par les constructeurs.\nIl revend sa parcelle à Joseph Raimbaud, marchand de bois en lien avec le milieu de la construction navale. Celui-ci fait construire l'immeuble en 1755-56.\n\n3 étages et combles sans entresol\n\nLes immeubles du lotissement Feydeau sont tantôt entresolé, tantôt non. La présence de l'entresol révèle l'importance accordée à l'activité commerciale : celui-ci permet d'installer des réserves et des bureaux. Dans le cas présent, les constructeurs ont souhaité privilégier le logement. Aussi le rez-de-chaussée est-il occupé par des appartements.\n\nUne innovation : des appartements avec un couloir\n\nJusqu'au début du XVIIIe siècle, on ne connaît qu'une seule manière d'agencer les pièces d'un appartement : l'enfilade. Les différentes salles se commandent les unes les autres. Au fil du siècle, le désir d'intimité grandissant, on voit apparaître le couloir, jugé plus pratique. Cet immeuble est le seul dans Feydeau à présenter cette particularité.\n\nUne décoration soignée\n\nContrairement à d'autres immeubles du lotissement, les façades sur rue et quai sont identiques. Toutes les ouvertures comportent un mascaron, avec des visages africains. Les balcons sont construits sur des consoles au 1er étage et sur trompe au 2ème. Les angles de la cour ainsi que les demi-tourelles de latrines sont à pans coupés. L'immeuble est Inscrit sur l'inventaire supplémentaire des monuments historiques depuis 1984.",
    events: ["alain-gremillet", "jerome-gourdon", "nadege-hameau", "pauline-crusson"],
    visited: false
  },
  {
    id: "rue-kervegan-17",
    name: "17 rue Kervégan / 11 quai Turenne",
    x: 260,
    y: 407,
    description: "Immeuble de la 'galaxie Pierre Rousseau' (après 1775). Construit pour Pierre Lassalle, gendre de Pierre Rousseau. Particularité: corps de bâtiments indépendants sur quai et rue, avec cour commune. Façade sobre typique de la fin du 18ème siècle, mais intérieurs richement décorés.",
    image: "/17 rue Kervégan.jpg",
    history: "11, allée Turenne / 17, rue Kervégan\n\nUn immeuble de la \"galaxie Pierre Rousseau\"\n\nCet immeuble a été construit après 1775 pour Pierre Lassalle, gendre de Pierre Rousseau. Ce dernier reprend une partie des dispositions adoptées au 12, allée Turenne, qu'il a construit comme immeuble de rapport en 1753.\n\nUne parcelle pour deux immeubles indépendants\n\nContrairement à d'autres immeubles de Feydeau. Le corps de bâtiment sur le quai Turenne et celui sur la rue Kervégan sont indépendants. Si la cour est commune, Ils possèdent chacun leur propre escalier et deux latrines par étage. \n\nChacun des immeubles comprenait à l'origine un appartement par étage, constitué de 4 pièces en façade et deux pièces de part et d'autre de l'escalier. Par la suite, certains logements ont été divisés.\n\nDécoration\n\nAu fil du 18ème siècle, on s'achemine vers un type de façade de plus en plus sobre : les mascarons, les balcons sur trompe ou sur consoles sculptées disparaissent, La place Royale en est un bon exemple. Si les façades de cet immeuble ne comportent ni balcons, ni décoration, les intérieurs n'ont rien à envier à ceux de la génération précédente.\n\nPetits ou grand vitrages\n\nJusqu'aux années 1750, les vantaux des fenêtres sont à petits bois. Dans les années 1760 apparaît le grand carreau, qui est, dans un premier temps, réservé aux grandes demeures. On peut donc affirmer avec certitude que tous les immeubles de l'Île Feydeau avaient à l'origine des fenêtres à petits bois.",
    events: ["marie-husson"],
    visited: false
  },
  {
    id: "allee-duguay-trouin-11",
    name: "11 allée Duguay Trouin / 20 rue Kervégan",
    x: 150,
    y: 186,
    description: "Immeuble de rapport (1752) construit par Bertrand Doudet, négociant. Particularité: système de galeries très développé avec escalier unique ouvrant sur trois faces. Deux appartements spacieux par étage (200 m²). Façade côté Duguay-Trouin reconstruite à l'identique après les bombardements de 1945.",
    image: "/20 rue Kervégan.jpg",
    history: "11, allée Duguay / Trouin 20 rue Kervégan\n\nUn immeuble de rapport\n\nBertrand Doudet, négociant, acquiert en 1747 une des parcelles du lotissement auprès de la veuve Beaulieu-Belloteau, dont le mari était un des actionnaires d'origine. En 1752, la 'maison' est terminée : il en habite un des appartements. Les autres sont probablement loués. \n\nDes appartements donnant sur des galeries\n\nDe tous les immeubles de l'île Feydeau, c'est dans celui-ci que ce système constructif est le plus développé : l'unique escalier ouvre sur trois faces de galeries. Chaque étage comprend à l'origine deux appartements : l'un côté Kervégan, l'autre côté Duguay-Trouin, soit un peu plus de 200 m2 par appartement. On trouve donc deux portes d'entrée sur chaque palier de l'escalier, qui donnent sur la coursière de chaque appartement. Sur celle-ci ouvrent les porte-fenêtres de chaque pièce. On trouve également, juste après la porte d'entrée, des toilettes. On habite en fonction de sa condition… \n\nOn peut supposer que Bertrand Doudet s'était réservé un des deux appartements du 1er étage. Il faut imaginer qu'à l'époque, habiter haut, c'est multiplier les contraintes : monter les seaux d'eau, le bois… Par ailleurs, le 1er étage est toujours celui qui offre la plus grande hauteur sous plafond, les plus belles cheminées, et les éléments de décoration les plus remarquables (boiseries, parquets à la française, fontaines à eau dans des niches...). Certains de ces éléments sont encore présents dans l'immeuble.\n\nNi classé, ni inscrit\n\nMême s'il s'agit d'un immeuble remarquable, cette maison ne comporte pas d'éléments de décoration qui justifient une demande de protection. La façade ne présente ni mascarons, ni balcons sur trompe ou sur consoles. Ce type d'immeuble se retrouve fréquemment dans le centre ancien. Ce qui fait la typicité de celui-ci, comme de tous les immeubles de Feydeau, est la largeur des façades, qui a permis de créer dans chacun des appartements une enfilade de trois grandes pièces.\n\nLes modes passent\n\nA la fin du XVIIIème siècle, Feydeau n'est plus à la mode. Les Nantais préfèrent habiter les nouveaux quartiers plus en hauteur : les cours près de la Cathédrale et surtout le quartier Graslin. Les propriétaires changent et certains des appartements sont divisés. Les habitants des immeubles sont souvent de condition plus modeste.\n\nLes vicissitudes de la seconde guerre mondiale\n\nL'immeuble a souffert durant les bombardements. En 1945, sa façade côté Duguay-Trouin est pour partie détruite. La SNCF, locataire de l'immeuble pour y loger son personnel, fait démolir et reconstruire cette façade à l'identique. Seules les baies du rez-de-chaussée sont agrandies, pour faciliter l'activité commerciale. Pour ce chantier, on réutilise les parpaings de granite du rez-de-chaussée, et on remplace le tuffeau des étages par une pierre plus dure. L'immeuble a fait l'objet d'une restauration générale durant les années 1990. La façade côté Duguay-Trouin en cours de reconstruction au printemps 1948.",
    events: ["clotilde-debar-zablocki", "malou-tual", "gael-caudoux"],
    visited: false
  },
  {
    id: "allee-duguay-trouin-15",
    name: "15 allée Duguay Trouin",
    x: 150,
    y: 407,
    description: "Deux immeubles de rapport (1753) construits par les négociants Razeau et Geslin. Façade remarquable avec six travées et décor soigné: balcons sur consoles sculptées, chapiteaux ioniques, fronton et ferronneries. Habité par des négociants occupant un étage entier. Restauré en 1995. Monument Historique depuis 1984.",
    image: "/15 allée Duguay-Trouin.jpg",
    history: "15 allée Duguay Trouin\nDeux immeubles de rapport\n\nDe même que pour d'autres parcelles du lotissement, le propriétaire initial du terrain, Adrien van Voorn, n'en est pas le bâtisseur. Il revend sa parcelle à Paul-Louis-Julien Razeau et René Geslin, tous deux négociants. Ceux-ci font construire par les architectes Nicolas Rainard et Pierre Desprées deux immeubles de rapport achevés en 1753.\nUne architecture soignée\n\nLa façade possède six travées à arcs surbaissés au rez-de-chaussée. Les deux travées centrales sont richement traitées : balcons sur consoles sculptées au 1er étage et sur trompe au 2ème, chapiteaux ioniques et fronton. Les ferronneries sont remarquables. La cour comporte deux tourelles pour les toilettes.\nLes habitants\n\nEn 1776, les deux immeubles sont essentiellement habités par des négociants, qui disposent chacun d'un étage entier (appartements de 6 ou 7 pièces).\nUne restauration exemplaire côté Duguay-Trouin\n\nL'immeuble a été entièrement restauré à partir de 1995. Le relevé de l'existant a été effectué avec beaucoup de soin. Des menuiseries à petits bois ont été réintroduites, qui redonnent à la façade son aspect du XVIIIème siècle. Les façades et toitures sur l'allée Duguay-Trouin, la rue Kervégan et la cour sont inscrites à l'inventaire supplémentaire des Monuments historiques depuis le 5 décembre 1984.",
    events: [],
    visited: false
  },
  {
    id: "allee-duguay-trouin-16",
    name: "16 allée Duguay Trouin",
    x: 150,
    y: 450,
    description: "Immeuble du XVIIIe siècle situé dans la partie sud de l'Île Feydeau. Cet immeuble présente une architecture typique du lotissement avec une cour intérieure et des espaces d'exposition. Il accueille aujourd'hui des artistes contemporains dans ses espaces rénovés.",
    image: "/16 allée Duguay-Trouin.jpg",
    history: "16 allée Duguay Trouin\n\nUn espace artistique contemporain\n\nCet immeuble du XVIIIe siècle, situé dans la partie sud de l'Île Feydeau, témoigne de l'architecture typique du lotissement. Construit à l'origine pour des négociants nantais, il a connu diverses transformations au fil des siècles. Aujourd'hui, ses espaces rénovés accueillent des artistes contemporains qui y trouvent un cadre historique inspirant pour leurs créations.\n\nUne architecture préservée\n\nL'immeuble conserve les caractéristiques architecturales de l'époque: une cour intérieure, des espaces généreux et une façade sobre typique de la fin du XVIIIe siècle. La rénovation a permis de préserver l'esprit du lieu tout en l'adaptant aux besoins des artistes qui y exposent régulièrement.\n\nUn lieu de création et d'exposition\n\nLe bâtiment est devenu un lieu important pour la scène artistique nantaise, accueillant des expositions temporaires et des ateliers d'artistes. Sa configuration avec une cour et un hall offre des espaces d'exposition variés, permettant de mettre en valeur différentes formes d'expression artistique.",
    events: ["nathalie-douillard", "isabelle-thouy", "marie-helene-le-ny"],
    visited: false
  },
  {
    id: "rue-kervegan-32",
    name: "32 rue Kervégan",
    x: 162,
    y: 507,
    description: "Immeuble construit entre 1747 et 1752 par Guillaume Grou, négociant-armateur. Façade modifiée au 19e siècle avec ajout d'un troisième étage. Organisation typique: appartement de l'armateur au premier, bureaux au rez-de-chaussée entresolé, appartements locatifs aux étages supérieurs. Monument Historique: façade et ferronneries (1932), cage d'escalier (1986).",
    image: "/32 rue Kervegan.jpg",
    history: "32 rue Kervégan\n\nEntre 1747 et 1752, Guillaume Grou, négociant-armateur, fait construire cet immeuble sur l'île Feydeau. La composition d'origine de la façade a été modifiée au début du 19e siècle par l'ajout d'un troisième étage. L'immeuble abritait au premier étage l'appartement de l'armateur dont l'accès se faisait par la porte de la façade principale. Le rez-de-chaussée entresolé était occupé par des bureaux et magasins. Les appartements locatifs des étages supérieurs étaient desservis par une porte latérale donnant rue Kervégan. La façade y compris les ferronneries et la toiture sont inscrites au titre des Monuments Historiques depuis 1932, la cage d'escalier intérieur est, quant à elle, inscrite en 1986.",
    events: ["philippe-pengrech", "jean-francois-bouron"],
    visited: false
  },
  {
    id: "rue-duguesclin",
    name: "Rue Duguesclin",
    x: 130,
    y: 310,
    description: "Mur Le Chat Noir jusqu'à rue Kervégan. Située sur l'Île Feydeau, cette rue piétonne relie la rue Kervégan à l'allée Duguay Trouin. Elle est caractérisée par son architecture du XVIIIe siècle et abrite aujourd'hui des espaces d'exposition temporaires.",
    history: "Rue Duguesclin\n\nCette rue piétonne de l'Île Feydeau porte le nom de Bertrand du Guesclin, connétable de France au XIVe siècle. Elle fait partie du lotissement original de l'Île, conçu au XVIIIe siècle. Aujourd'hui, elle accueille des expositions temporaires qui animent ce passage historique entre la rue Kervégan et l'allée Duguay Trouin.",
    events: ["pauline-crusson"],
    visited: false
  }
];
