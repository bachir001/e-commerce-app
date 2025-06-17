import axiosApi from "@/apis/axiosApi";
import { Category } from "@/app/(tabs)/home/ProductDetails";
import { Brand, Product } from "@/types/globalTypes";
import { useQuery } from "@tanstack/react-query";
import { AxiosResponse } from "axios";

interface MainDetail extends Product {
  sku: string;
  video_url: string | null;
  quantity: number;
  value_points: number;
  details: string;
  brand: Brand;
  categories: Category[];
}
interface GetProductApiResponse {
  status: boolean;
  message?: string;
  data: {
    mainDetail: MainDetail;
  };
}

export default function useGetProductDetails(slug: string) {
  return useQuery({
    queryKey: ["product", slug],
    queryFn: async () => {
      console.log("I ran");
      const response: AxiosResponse<GetProductApiResponse> = await axiosApi.get(
        `getProduct/${slug}`
      );
      console.log(response.data.data);
      if (!response) {
        throw new Error("Cannot get product");
      }
      return response.data.data.mainDetail;
    },
  });
}
