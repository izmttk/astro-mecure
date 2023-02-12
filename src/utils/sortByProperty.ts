export type SortableObject<T, K extends keyof T> = T[K] extends string | number ? T : never;

export default function sortByProperty<T, K extends keyof T>(
  dataset: SortableObject<T, K>[],
  sortBy: K,
  order: 'asc' | 'desc' = 'asc'
) {
  function getCompare(sortBy: K, order: 'asc' | 'desc') {
    const coefficient = order === 'desc' ? -1 : 1;
    return (a: T, b: T) => {
      const aProp = a[sortBy];
      const bProp = b[sortBy];
      if (typeof aProp === 'number' && typeof bProp === 'number') {
        return (aProp - bProp) * coefficient;
      }
      if (typeof aProp === 'string' && typeof bProp === 'string') {
        return aProp.localeCompare(bProp, 'zh-CN') * coefficient;
      }
      return 0;
    }
  }
  return dataset.sort(getCompare(sortBy, order));
}
