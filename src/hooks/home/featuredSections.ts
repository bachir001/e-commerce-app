import { useQuery } from "@tanstack/react-query";
import axiosApi from "@/apis/axiosApi";
import { Product } from "@/types/globalTypes";

export function useFeaturedSection(
  type: string,
  fetchParams?: Record<string, any>,
  shouldFetch?: boolean
) {
  return useQuery({
    queryKey: ["products", type, fetchParams],
    enabled: shouldFetch,
    queryFn: async () => {
      const params = new URLSearchParams();

      if (fetchParams) {
        Object.entries(fetchParams).forEach(([key, value]) => {
          if (value !== undefined) {
            params.append(key, String(value));
          }
        });
      }

      const queryString = params.toString();
      const url = `${type}${queryString ? `?${queryString}` : ""}`;

      const response = await axiosApi.get(url);
      return response.data.data.results as Product[];
    },
  });
}
