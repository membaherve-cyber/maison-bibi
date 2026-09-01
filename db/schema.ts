/**
 * Type definitions for the database rows.
 *
 * The source used Drizzle ORM's `pgTable` to define both the schema and the
 * TypeScript types. This project uses Prisma + SQLite (see `prisma/schema.prisma`),
 * but the seed data and helpers still reference these row shapes, so the types
 * are preserved here as plain interfaces.
 */

export type PropertyRow = {
  id: number;
  slug: string;
  reference: string;
  title: string;
  titleEn: string;
  shortDescription: string;
  description: string;
  descriptionEn: string;
  region: string;
  city: string;
  neighborhood: string;
  address: string;
  latitude: string;
  longitude: string;
  propertyType: string;
  transactionType: string;
  availability: string;
  price: number;
  currency: string;
  pricePeriod: string;
  bedrooms: number | null;
  bathrooms: number | null;
  livingRooms: number | null;
  rooms: number | null;
  livingArea: number | null;
  landArea: number | null;
  floor: string;
  buildYear: number | null;
  parkingSpaces: number | null;
  condition: string;
  amenities: string[];
  amenitiesEn: string[];
  images: string[];
  featured: boolean;
  verifiedLandTitle: boolean;
  status: string;
  agentId: number | null;
  views: number;
  source: string;
  sourceUrl: string;
  sourceReference: string;
  seoTitle: string;
  seoDescription: string;
  ogImage: string;
  noindex: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type NewPropertyRow = {
  slug: string;
  title: string;
  titleEn?: string;
  shortDescription?: string;
  description?: string;
  descriptionEn?: string;
  region?: string;
  city?: string;
  neighborhood?: string;
  address?: string;
  propertyType: string;
  transactionType?: string;
  availability?: string;
  price?: number;
  currency?: string;
  pricePeriod?: string;
  bedrooms?: number | null;
  bathrooms?: number | null;
  livingRooms?: number | null;
  rooms?: number | null;
  livingArea?: number | null;
  landArea?: number | null;
  floor?: string;
  buildYear?: number | null;
  parkingSpaces?: number | null;
  condition?: string;
  amenities?: string[];
  amenitiesEn?: string[];
  images?: string[];
  featured?: boolean;
  verifiedLandTitle?: boolean;
  status?: string;
  agentId?: number | null;
  views?: number;
  source?: string;
  sourceUrl?: string;
  sourceReference?: string;
  seoTitle?: string;
  seoDescription?: string;
  ogImage?: string;
  noindex?: boolean;
};

export type UserRow = {
  id: number;
  username: string;
  email: string;
  name: string;
  passwordHash: string;
  role: string;
  phone: string;
  avatar: string;
  active: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
};

export type ArticleRow = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  categoryId: number | null;
  authorId: number | null;
  authorName: string;
  tags: string[];
  status: string;
  publishedAt: Date | null;
  seoTitle: string;
  seoDescription: string;
  createdAt: Date;
  updatedAt: Date;
};

export type ServiceRow = {
  id: number;
  slug: string;
  name: string;
  nameEn: string;
  shortDescription: string;
  description: string;
  descriptionEn: string;
  icon: string;
  image: string;
  position: number;
  published: boolean;
};

export type RequestRow = {
  id: number;
  name: string;
  phone: string;
  email: string;
  message: string;
  requestType: string;
  propertyId: number | null;
  propertyTitle: string;
  propertyReference: string;
  customerId: number | null;
  source: string;
  sourcePage: string;
  status: string;
  agentId: number | null;
  internalNotes: string;
  createdAt: Date;
  updatedAt: Date;
};

export type MediaRow = {
  id: number;
  filename: string;
  url: string;
  thumbnailUrl: string;
  mimeType: string;
  width: number;
  height: number;
  originalSize: number;
  optimizedSize: number;
  alt: string;
  folder: string;
  uploadedBy: number | null;
  createdAt: Date;
};
