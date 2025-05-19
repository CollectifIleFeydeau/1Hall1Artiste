
// Artists data for exhibitions and concerts
export type Artist = {
  id: string;
  name: string;
  type: "exposition" | "concert";
  title: string;
  description: string;
  time: string;
  location: string;
  days: ("samedi" | "dimanche")[];
  bio: string;
  contact: string;
  image?: string;
};

export const artists: Artist[] = [
];
