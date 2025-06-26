export interface UserContextType {
  id: number;
  first_name: string;
  last_name: string;
  mobile: string | null;
  gender_id: number;
  gender: string;
  date_of_birth: string | Date;
  email: string | null;
  email_verified: boolean;
  mobile_verified: boolean;
}

export interface Address {
  id: number;
  street: string;
  city: string;
}

export interface Governorate {
  id: number;
  name: string;
}

export interface SessionContextValue {
  sessionId: string | null;
  isLogged: boolean;
  setIsLogged: React.Dispatch<React.SetStateAction<boolean>>;
  user: UserContextType | null;
  setUser: React.Dispatch<React.SetStateAction<UserContextType | null>>;
  token: string | null;
  setToken: React.Dispatch<React.SetStateAction<string | null>>;
  addresses: Address[];
  setAddresses: React.Dispatch<React.SetStateAction<Address[]>>;
  addAddress: (address: Address) => void;
  governorates: Governorate[];
  setGovernorates: React.Dispatch<React.SetStateAction<Governorate[]>>;
  newArrivals: Product[] | null;
  sectionIsPending: boolean;
  setSectionIsPending: React.Dispatch<React.SetStateAction<boolean>>;
}

export interface Brand {
  id: number;
  name: string;
  image?: string;
  white_image?: string;
  slug: string;
  backgroundColor?: string;
}

export interface Slider {
  to_url?: string;
  title: string;
  description: string;
  image?: string;
  mobile_image: string;
  model_type: any;
  model_name: string;
  model_slug: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  highlights: string;
  discount: number;
  quantity: number;
  price: number;
  special_price?: number | null;
  start_date: string | null;
  end_date: string | null;
  show_counter: boolean | null;
  slug: string;
  image: string;
  gallery: string[] | null;
  has_variants: boolean;
  rating: number;
  purchase_points: number | null;
  reviews?: number;
  product_image?: string;
}

export interface popularSearches {
  id: number;
  query: string;
  count: number;
}

export interface CategoryInfo {
  id: number;
  name: string;
  slug: string;
  image: string | null;
  description: string | null;
}

export interface MegaCategory extends CategoryInfo {
  mega_bg: string;
  mega_mobile_bg: string;
  mega_title: string;
  mega_title_color: string;
  mega_description: string;
  mega_description_color: string;
}

export interface RelatedCategory extends CategoryInfo {
  mega_primary: boolean;
}

export interface GeneralCategory extends CategoryInfo {
  image: string | null;
  main_image?: string;
  category_cover_image?: string;
  relatedCategories: RelatedCategory[];
}
