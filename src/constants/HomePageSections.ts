export interface HomePageSectionProp {
  id: number;
  type: string;
  title?: string;
  fetchParams?: {
    per_page: number;
    page: number;
    sort: string;
  };
  description?: string;
}

export const HOMEPAGE_SECTIONS: HomePageSectionProp[] = [
  { id: 1, type: "header" },
  {
    id: 2,
    type: "all-categories",
  },
  {
    id: 3,
    title: "New Arrivals",
    type: "new-arrivals", //used for fetching
    description: "Check out our latest products",
    fetchParams: {
      per_page: 5,
      page: 1,
      sort: "price_high_low",
    },
  },
  {
    id: 4,
    title: "Deals of the Day",
    description: "Buy Now Before It's Gone",
    type: "daily-deals",
    fetchParams: {
      per_page: 5,
      page: 1,
      sort: "price_high_low",
    },
  },
  {
    id: 5,
    title: "Best Sellers",
    type: "best-sellers",
    description: "Check out our best selling products",
    fetchParams: {
      per_page: 15,
      page: 1,
      sort: "price_high_low",
    },
  },

  //   //Specific Categories
  //   {
  //     id: 6,
  //     title: "Beauty & Health",
  //     type: "beauty-health",

  //   }
];
