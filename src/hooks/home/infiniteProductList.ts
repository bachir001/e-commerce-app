import axiosApi from "@/apis/axiosApi";
import { Product } from "@/types/product";
import { useInfiniteQuery } from "@tanstack/react-query";
import { use } from "react";

export interface ProductListProps {
  type: "mega" | "featured" | "categoryData";
  url: string;
  loadMoreProducts: boolean;
  onLoadComplete?: () => void;
  onFetchTriggered?: () => void;
}

export default function useInfiniteProductList({
  type,
  url,
}: ProductListProps) {
  return useInfiniteQuery({
    queryKey: ["products", type, url],
    queryFn: async ({ pageParam = 1 }) => {
      try {
        const response = await axiosApi.get(
          `${url}?page=${pageParam}&per_page=20`
        );

        if (type === "categoryData") {
          const relatedProducts = response.data?.data?.relatedProducts;
          if (!relatedProducts) {
            console.warn("Missing relatedProducts in response");
            return {
              products: [],
              currentPage: pageParam,
              totalPages: pageParam,
            };
          }

          return {
            products: relatedProducts.results || [],
            currentPage: relatedProducts.current_page,
            totalPages: relatedProducts.total_pages,
          };
        }

        return {
          products: [],
          currentPage: pageParam,
          totalPages: pageParam,
        };
      } catch (error) {
        console.error("Error fetching products:", error);
        throw error;
      }
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage) return undefined;
      return lastPage.currentPage < lastPage.totalPages
        ? lastPage.currentPage + 1
        : undefined;
    },
    initialPageParam: 1,
    staleTime: 20 * 60 * 1000,
  });
}
