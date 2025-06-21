export default function createCategoryIdsParams(categoryIds: number[]) {
  const categoriesObj: {
    categories?: string;
  } = {};

  if (categoryIds.length > 0) {
    categoriesObj.categories = categoryIds.join(",");
  }

  return {
    categories: categoriesObj.categories,
    categoryId: categoryIds[0],
  };
}
