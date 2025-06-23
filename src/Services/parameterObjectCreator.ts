export default function createIdParams(idList: number[], paramName: string) {
  const categoriesObj: {
    [paramName]?: string;
  } = {};

  if (idList.length > 0) {
    categoriesObj[paramName] = idList.join(",");
  }

  return {
    [paramName]: categoriesObj[paramName],
    id: idList[0],
  };
}
