type CamelCase<S extends string> = S extends `${infer P}_${infer Q}${infer R}`
  ? `${P}${Uppercase<Q>}${CamelCase<R>}`
  : S;

// A recursive mapped type to apply CamelCase transformation to keys in an object
type Camelize<T> = T extends Array<infer U>
  ? Array<Camelize<U>>
  : T extends object
  ? {
      [K in keyof T as CamelCase<K & string>]: Camelize<T[K]>;
    }
  : T;

// The camelize function with a generic parameter to preserve and map types
export function camelize<T>(obj: T): Camelize<T> {
  if (Array.isArray(obj)) {
    return obj.map((v) => camelize(v)) as Camelize<T>;
  } else if (obj !== null && typeof obj === "object") {
    return Object.keys(obj).reduce((result, key) => {
      const value = (obj as any)[key];
      const newKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
      const newValue = camelize(value);
      return { ...result, [newKey]: newValue };
    }, {} as any) as Camelize<T>;
  }
  return obj as Camelize<T>;
}
