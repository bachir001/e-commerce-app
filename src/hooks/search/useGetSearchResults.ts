import axiosApi from "@/apis/axiosApi";
import { Product } from "@/types/globalTypes";
import { useQuery } from "@tanstack/react-query";

export default function useGetSearchResults(query: string) {
  return useQuery({
    queryKey: ["search-products", query],
    queryFn: async (): Promise<Product[]> => {
      const response = await axiosApi.get(
        `search?q=${encodeURIComponent(query.trim())}&limit=10`
      );
      return response.data.data.results as Product[];
    },
    enabled: false,
    retry: 0,
  });
}
