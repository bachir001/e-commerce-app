export interface HomePageSectionProp {
  id?: number;
  type: string;
  title?: string;
  fetchParams?: {
    per_page: number;
    page: number;
    sort: string;
  };
  description?: string;
  mega_mobile_bg?: string;
  startFromLeft?: boolean;
}

export const HOMEPAGE_SECTIONS = {
  bestSellers: {
    description: "Check out our best sellers!",
    title: "Best Sellers",
    type: "best-sellers" as const,
    fetchParams: {
      per_page: 15,
      sort: "price_high_low" as const,
      page: 1,
    },
    startFromLeft: true,
  } as HomePageSectionProp,
  newArrivals: {
    description: "Check out our latest products!",
    title: "New Arrivals",
    type: "new-arrivals" as const,
    fetchParams: {
      per_page: 15,
      sort: "price_high_low" as const,
      page: 1,
    },
    startFromLeft: false,
  } as HomePageSectionProp,
  beautyAndHealth: {
    description: "Improve your skin health now!",
    title: "Beauty & Health",
    type: "beauty-health" as const,
    fetchParams: {
      per_page: 15,
      // sort: "price_high_low" as const,
      page: 1,
    },
  } as HomePageSectionProp,
  homeAndLiving: {
    description: "Shop Home & Living",
    title: "Home & Living",
    type: "home-living" as const,
    fetchParams: {
      per_page: 15,
      // sort: "price_high_low" as const,
      page: 1,
    },
  } as HomePageSectionProp,
  medicalEquipment: {
    description: "Trusted by experts, designed for care.",
    title: "Medical Equipment",
    type: "medical-equipment" as const,
    fetchParams: {
      per_page: 15,
      // sort: "price_high_low" as const,
      page: 1,
    },
    // mega_mobile_bg:
    //   "https://api-gocami-test.gocami.com/storage/8181/medical-mobile.webp",
  } as HomePageSectionProp,
  agriculture: {
    description: "Tend Your Garden With Reliable Tools and Equipments",
    title: "Agriculture Equipments",
    type: "garden-tools" as const,
    fetchParams: {
      per_page: 15,
      // sort: "price_high_low" as const,
      page: 1,
    },
    // mega_mobile_bg:
    //   "https://api-gocami-test.gocami.com/storage/8219/Agriculture-mobile.webp",
  } as HomePageSectionProp,
  hardwareAndFasteners: {
    description: "Strong Connections Start with Reliable Fasteners",
    title: "Hardware & Fasteners",
    type: "hardware-and-fasteners" as const,
    fetchParams: {
      per_page: 15,
      // sort: "price_high_low" as const,
      page: 1,
    },
    // mega_mobile_bg:
    //   "https://api-gocami-test.gocami.com/storage/12263/1.webp",
  } as HomePageSectionProp,
  sportsAndOutdoors: {
    description: "Shop and Embrace the Great Outdoors!",
    title: "Sports & Outdoors",
    type: "sports-outdoor" as const,
    fetchParams: {
      per_page: 15,
      // sort: "price_high_low" as const,
      page: 1,
    },
    // mega_mobile_bg:
    //   "https://api-gocami-test.gocami.com/storage/12255/camping-mobile.webp",
  } as HomePageSectionProp,
  specialDeals: {
    description: "Checkout our special deals!",
    title: "Special Deals",
    type: "special-deals",
    fetchParams: {
      per_page: 15,
      sort: "default" as const,
      page: 1,
    },
  },
};
