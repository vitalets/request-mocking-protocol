type StripUndefined<T> = {
  [K in keyof T as T[K] extends undefined ? never : K]: T[K];
};

export function omitUndefined<T extends object>(obj: T | undefined) {
  return Object.fromEntries(
    Object.entries(obj || {}).filter(([, value]) => value !== undefined),
  ) as StripUndefined<T>;
}

export function mergeOptions<T extends object, U extends object, V extends object>(
  source1: T,
  source2?: U,
  source3?: V,
) {
  return Object.assign({}, omitUndefined(source1), omitUndefined(source2), omitUndefined(source3));
}
