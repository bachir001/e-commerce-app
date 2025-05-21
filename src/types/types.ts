// types.ts

/** The possible sorting options for product lists */
export type SortOption =
  | 'default'
  | 'newest'
  | 'a-z'
  | 'z-a'
  | 'price-asc'
  | 'price-desc';

/** A single filter item (e.g. one brand, one color, one category) */
export interface FilterItem {
  id: number;
  name: string;
  /** only present on color filters */
  code?: string;
}

/** The min/max bounds returned by the API for price sliders */
export interface PriceBounds {
  priceMin: number;
  priceMax: number;
}

/**
 * All of the filters that your API returned.
 * 
 * - `filters` is a map from the API’s key (e.g. "brands", "colors", "categories")
 *   to an array of FilterItem objects.
 * - `bounds` is only set if the API returns a `prices` object.
 */
export interface AvailableFilters {
  filters: Record<string, FilterItem[]>;
  bounds?: PriceBounds;
}

/**
 * What the user has currently selected:
 * 
 * - `selectedByKey` is a map from each filter key to the array
 *   of item‑IDs the user has checked.
 * - `priceRange` is the current [min, max] the user has chosen.
 * - `sortOption` is which sort button the user picked.
 */
export interface SelectedFilters {
  selectedByKey: Record<string, number[]>;
  priceRange: [number, number];
  sortOption: SortOption;
}
