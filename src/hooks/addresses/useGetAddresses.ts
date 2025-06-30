import axiosApi from "@/apis/axiosApi";
import { useSessionStore } from "@/store/useSessionStore";
import { useQuery } from "@tanstack/react-query";

export default function useGetAddresses() {
  const { token } = useSessionStore();
  return useQuery({
    queryKey: ["addresses", token],
    retry: 0,
    queryFn: async () => {
      if (token && typeof token === "string") {
        const response = await axiosApi.get("/addresses", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 404) {
          //The backend implementation sets 404 = empty array
          return [];
        }

        const sortedDefault = [...response.data.data].sort(
          (a, b) => b.is_default - a.is_default
        );
        return sortedDefault;
      }

      return [];
    },
    staleTime: 1000 * 60 * 60 * 24,
  });
}
