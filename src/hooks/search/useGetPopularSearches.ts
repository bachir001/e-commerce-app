import axiosApi from "@/apis/axiosApi";
import { useQuery } from "@tanstack/react-query";

export default function useGetPopularSearches() {
  return useQuery({
    queryKey: ["popularSearches"],
    queryFn: async () => {
      try {
        const response = await axiosApi.get("/search/popular");

        return response.data.data || [];
      } catch (err) {
        console.error(err);
        throw new Error("Failed to load popular searches");
      }
    },
  });
}
