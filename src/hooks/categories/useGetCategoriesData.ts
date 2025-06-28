import axiosApi from "@/apis/axiosApi";
import { MainCategory } from "@/app/(tabs)/categories";
import { useQuery } from "@tanstack/react-query";

export default function useGetCategoriesData() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      try {
        const response = await axiosApi.get("/categories-data");

        if (response.status === 200) {
          return response.data.data as MainCategory;
        }

        return [];
      } catch (err) {
        console.error(err);
      }
    },
  });
}
