import axiosApi from "@/apis/axiosApi";
import { Product } from "@/types/product";
import { useQuery } from "@tanstack/react-query";

export default function useGetRelatedProducts(slug: string) {
  return useQuery({
    queryKey: ["related-products", slug],
    queryFn: async (): Promise<Product[]> => {
      const response = await axiosApi.get(`related-products/${slug}`);

      if (!response) {
        throw new Error("Cannot get related products");
      }

      return response.data.data;
    },
  });
}
