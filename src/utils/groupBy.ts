interface GroupedData<T> {
  [key: keyof any]: Array<T>;
}

export default function groupBy<T>(raw: Array<T>, getGroup: (data: T) => keyof any): GroupedData<T> {
  return raw.reduce<GroupedData<T>>((prev, cur) => {
    const group = getGroup(cur);
    if (!prev[group]) {
      prev[group] = [];
    }
    prev[group].push(cur);
    return prev;
  }, {});
}