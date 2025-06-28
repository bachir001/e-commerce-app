import axiosApi from "@/apis/axiosApi";
import { CategoryInfo, RelatedCategory } from "@/types/globalTypes";
import { useQuery } from "@tanstack/react-query";

export interface CategoryData {
  categoryInfo: CategoryInfo;
  relatedCategories: RelatedCategory[];
}

export default function useGetCategoryRelatedCategories(
  slug: string,
  shouldFetch: boolean
) {
  return useQuery({
    queryKey: ["categoryData", slug],
    queryFn: async () => {
      const response = await axiosApi.get(
        `/getCategoryData/${slug}?page=1&per_page=1`
      );

      if (response.status === 200) {
        return {
          categoryInfo: response.data.data.categoryInfo as CategoryInfo,
          relatedCategories: response.data.data
            .relatedCategories as RelatedCategory[],
        } as CategoryData;
      }

      return {
        categoryInfo: null,
        relatedCategories: [],
      };
    },
    enabled: shouldFetch,
    retry: 0,
  });
}
