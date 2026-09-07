export type Purpose = "sale" | "rent" | "shortlet";
export type PropertyStatus = "available" | "sold" | "reserved" | "under-offer";
export type PropertyType =
  | "Duplex"
  | "Apartment"
  | "Land"
  | "Penthouse"
  | "Terrace"
  | "Commercial";
export type PromoBadge = "" | "HOT DEAL" | "PRICE REDUCED" | "NEW RELEASE";

export interface PropertyImage {
  url: string;
  alt: string;
}

export interface Property {
  id: string;
  title: string;
  slug: string;
  location: string;
  area: string;
  price: string;
  priceNumeric: number;
  priceUnit?: string;
  discountPrice?: number;
  badge?: PromoBadge;
  type: PropertyType;
  purpose: Purpose;
  beds: number;
  baths: number;
  toilets?: number;
  areaSqm: number;
  titleType: string;
  featured: boolean;
  published?: boolean;
  images: PropertyImage[];
  description: string;
  features: string[];
  coordinates: { label: string };
  status: PropertyStatus;
  videoUrl?: string;
  isCustom?: boolean;
  createdAt?: string;
  demo?: boolean;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  message: string;
  propertyTitle?: string;
  createdAt: string;
  source: "contact" | "inspection" | "whatsapp";
}

export interface Filters {
  search: string;
  location: string;
  type: string;
  purpose: string;
  minPrice: number;
  maxPrice: number;
  beds: string;
}

export interface InspectionRequest {
  name: string;
  phone: string;
  date: string;
  mode: "Physical" | "Virtual";
  propertyTitle: string;
}