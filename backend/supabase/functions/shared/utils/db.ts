import { Pool } from "postgres";

/**
 * Creates and returns a PostgreSQL connection pool using the provided database URL.
 *
 * @returns {Pool} A PostgreSQL connection pool instance.
 * 
 * @throws {Error} If the environment variable SUPABASE_DB_URL is not set or if its value is empty.
 *
 * @example
 * // Usage example:
 * const dbPool = pool();
 * // Now you can use the dbPool to perform database operations.
 * // For example, dbPool.connect(), dbPool.query(), etc.
 */
export const pool = () => {
  const SUPABASE_DB_URL = Deno.env.get("SUPABASE_DB_URL")!;
  return new Pool(SUPABASE_DB_URL, 1, true);
};

/**
 * Extracts the non-null properties from the given object to use as insert properties in an SQL query.
 *
 * @template T - The type of the object from which insert properties are extracted.
 * @param {T} obj - The object from which to extract insert properties.
 * @returns {string[]} An array of strings representing the non-null insert properties.
 *
 * @example
 * // Usage example:
 * const obj = { field1: "value1", field2: null, field3: "value3" };
 * const insertProperties = getInsertProperties(obj);
 * // insertProperties will be ["field1", "field3"]
 */
export const getInsertProperties = <T>(obj: T): string[] => {
  const properties = [];
  for (const key in obj) {
    if (obj[key]) properties.push(key);
  }
  return properties;
};

/**
 * Generates the insert values for an SQL query based on the given insert properties.
 *
 * @template T - The type of the insert properties.
 * @param {T[]} insertProperties - An array of insert properties.
 * @returns {string[]} An array of strings representing the insert values (e.g., ["$1", "$2", "$3"]).
 *
 * @example
 * // Usage example:
 * const insertProperties = ["field1", "field2", "field3"];
 * const insertValues = getInsertValues(insertProperties);
 * // insertValues will be ["$1", "$2", "$3"]
 */
export const getInsertValues = <T>(insertProperties: T[]): string[] => {
  const values: string[] = [];
  insertProperties.forEach((_, i) => values.push(`$${i + 1}`));
  return values;
};
