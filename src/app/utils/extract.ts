// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const extract = <T extends Record<string, any>>(
  obj: T,
  keys: (keyof T)[],
): Partial<T> => {
  const result: Partial<T> = {};
  for (const key of keys) {
    if (obj[key] !== undefined) {
      result[key] = obj[key];
    }
  }
  return result;
};
