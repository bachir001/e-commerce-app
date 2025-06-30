import { Image, Text, TouchableOpacity, View } from "react-native";
import StarRating from "./StarRating";
import ExpandableSection from "./ExpandableSection";
import { Clock, Shield } from "lucide-react-native";
import { router } from "expo-router";
import type { Brand, MainCategory } from "@/types/globalTypes";
import { allowedNiches, colorMap, niche } from "../categories/CategoryItem"; // Assuming this path is correct

interface ProductInformationProps {
  brand?: Brand;
  name: string;
  rating?: number;
  reviews?: number;
  sku?: string;
  inStock: boolean;
  description: string;
  expandedSections: {
    description: boolean;
    highlights: boolean;
    shipping: boolean;
  };
  productDetailLoading?: boolean;
  toggleSection: (
    section: keyof ProductInformationProps["expandedSections"]
  ) => void;
  highlights: string;
  categories?: MainCategory[];
}

export default function ProductInformation({
  brand,
  name,
  rating,
  reviews,
  sku,
  inStock,
  description,
  expandedSections,
  toggleSection,
  highlights,
  categories,
  productDetailLoading = true,
}: ProductInformationProps): React.ReactElement {
  return (
    <View className="px-4">
      {brand?.name ? (
        <View className="flex-row items-center mb-2">
          {brand.logo ? (
            <Image
              fadeDuration={0}
              source={{ uri: brand.logo }}
              className="w-6 h-6 mr-2 rounded-full"
            />
          ) : (
            <View className="w-6 h-6 mr-2 rounded-full bg-gray-200 items-center justify-center">
              <Text className="text-xs font-bold">{brand.name.charAt(0)}</Text>
            </View>
          )}
          <Text className="text-sm font-medium text-gray-600">
            {brand.name}
          </Text>
        </View>
      ) : null}

      <Text className="text-2xl font-bold text-gray-900 mb-2">{name}</Text>

      <StarRating rating={rating} reviews={reviews} />

      <View className="flex-row items-center justify-between mb-6">
        <View>
          {sku ? (
            <Text className="text-xs text-gray-500 mt-1">SKU: {sku}</Text>
          ) : null}
        </View>
        {!productDetailLoading ? (
          <View
            className={`px-3 py-1 rounded-full ${
              inStock ? "bg-green-100" : "bg-red-100"
            }`}
          >
            <Text
              className={`text-sm font-medium ${
                inStock ? "text-green-700" : "text-red-700"
              }`}
            >
              {inStock ? "In Stock" : "Out of Stock"}
            </Text>
          </View>
        ) : null}
      </View>

      <View className="h-px bg-gray-200 my-4" />

      {description ? (
        <ExpandableSection
          title="Product Description"
          content={description}
          isExpanded={expandedSections.description}
          onToggle={() => toggleSection("description")}
        />
      ) : null}

      {highlights ? (
        <ExpandableSection
          title="Highlights"
          content={highlights}
          isExpanded={expandedSections.highlights}
          onToggle={() => toggleSection("highlights")}
        />
      ) : null}

      <ExpandableSection
        title="Shipping & Returns"
        content=""
        isExpanded={expandedSections.shipping}
        onToggle={() => toggleSection("shipping")}
      />
      {expandedSections.shipping ? (
        <View className="mb-4">
          <View className="flex-row items-center mb-3">
            <Clock size={16} color="#5E3EBD" />
            <Text className="text-gray-700 ml-2">
              Delivery in 3-5 business days
            </Text>
          </View>
          <View className="flex-row items-center">
            <Shield size={16} color="#5E3EBD" />
            <Text className="text-gray-700 ml-2">30-day return policy</Text>
          </View>
        </View>
      ) : null}

      {categories && categories.length > 0 ? (
        <View className="mt-4 mb-6">
          <Text className="text-sm text-gray-500 mb-2">Categories</Text>
          <View className="flex-row flex-wrap">
            {categories.map((category: MainCategory, index: number) => (
              <TouchableOpacity
                onPress={() => {
                  const isAllowedNiche = allowedNiches.includes(
                    category.slug as niche
                  );
                  router.navigate({
                    pathname: isAllowedNiche ? "mega" : "category",
                    params: {
                      slug: String(category.slug),
                      color: colorMap[category.slug as niche],
                      id: String(category.id),
                    },
                  });
                }}
                key={category.id || index}
                className="bg-gray-100 rounded-full px-3 py-1 mr-2 mb-2"
              >
                <Text className="text-xs text-gray-700">{category.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ) : null}

      <View className="h-px bg-gray-200 my-4" />
    </View>
  );
}
