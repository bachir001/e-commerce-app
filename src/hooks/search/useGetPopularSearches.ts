import axiosApi from "@/apis/axiosApi";
import { useQuery } from "@tanstack/react-query";

export default function useGetPopularSearches() {
  return useQuery({
    queryKey: ["popularSearches"],
    queryFn: async () => {
      const response = await axiosApi.get("search/popular");

      if (!response) {
        throw new Error("Cannot get popular searches");
      }

      return response.data.data;
    },
  });
}
