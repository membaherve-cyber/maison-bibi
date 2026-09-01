export type TransactionType = "vente" | "location";

export type Property = {
  id: number;
  slug: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  city: string;
  neighborhood: string;
  address: string;
  propertyType: string;
  transactionType: TransactionType;
  price: number;
  currency: string;
  pricePeriod: string;
  bedrooms: number | null;
  bathrooms: number | null;
  livingRooms: number | null;
  livingArea: number | null;
  landArea: number | null;
  floor: string;
  parkingSpaces: number | null;
  amenities: string[];
  amenitiesEn: string[];
  images: string[];
  featured: boolean;
  verifiedLandTitle: boolean;
  status: string;
  condition: string;
  source: string;
  sourceUrl: string;
  sourceReference: string;
  reference: string;
  availability: string;
  region: string;
  shortDescription: string;
  agentId: number | null;
  views: number;
  seoTitle: string;
  seoDescription: string;
};

export const PROPERTY_TYPES = [
  "Appartement",
  "Villa",
  "Maison",
  "Terrain",
  "Bureau",
  "Local commercial",
  "Immeuble",
  "Entrepôt",
  "Duplex",
] as const;

export const CITIES = ["Douala", "Yaoundé"] as const;

export const NEIGHBORHOODS: Record<string, string[]> = {
  Douala: [
    "Bonapriso",
    "Bonanjo",
    "Akwa",
    "Bali",
    "Bonabéri",
    "Yassa",
    "Youpwe",
    "Logpom",
    "Zone portuaire",
    "Bonamoussadi",
    "Makepe",
    "Deido",
  ],
  Yaoundé: ["Bastos", "Nlongkak", "Odza", "Mvan", "Santa Barbara"],
};

export const AMENITY_FILTERS = [
  { fr: "Parking", en: "Parking", match: ["parking"] },
  { fr: "Climatisation", en: "Air conditioning", match: ["climatisation"] },
  { fr: "Balcon", en: "Balcony", match: ["balcon"] },
  { fr: "Sécurité / gardiennage", en: "Security", match: ["gardien", "vidéosurveillance", "barrière"] },
  { fr: "Groupe électrogène", en: "Backup generator", match: ["groupe électrogène"] },
  { fr: "Ascenseur", en: "Lift", match: ["ascenseur"] },
  { fr: "Eau", en: "Water supply", match: ["eau"] },
  { fr: "Piscine", en: "Pool", match: ["piscine"] },
];
