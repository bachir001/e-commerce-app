export interface BrandFilter {
  id: number;
  name: string;
  total: number;
}

export interface CategoryFilter {
  id: number;
  name: string;
  total: number;
  subcategories: { id: number; name: string; total: number; children: any }[];
}

export interface PriceFilter {
  min: string;
  max: string;
}

export interface DiscountFilter {
  min: string;
  max: string;
}

export interface ColorFilter {
  id: number;
  name: string;
  code: string;
}

export interface SizeFilter {
  id: number;
  name: string;
  code: string;
}

export interface AttributesFilter {
  id: number;
  name: string;
  options: SizeFilter[];
}

export type RatingFilter = number[];
