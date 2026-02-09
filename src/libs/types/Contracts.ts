/**
 * Utility type to extract the keys (property names) of a given type `T`.
 *
 * @template T - The type from which to extract the keys.
 * @example
 * type Example = { a: string; b: number };
 * type Keys = ContractNames<Example>; // 'a' | 'b'
 */
export type ContractNames<T> = keyof T;

/**
 * Utility type to map the keys of a given type `T` to their corresponding types.
 *
 * @template T - The type to map.
 * @example
 * type Example = { a: string; b: number };
 * type Mapped = ContractTypes<Example>; // { a: string; b: number }
 */
export type ContractTypes<T> = { [K in keyof T]: T[K] };

/**
 * Function to get an array of contract type names (keys) for a given type `T`.
 *
 * @template T - The type for which to get the keys.
 * @returns {Array<keyof T>} An empty array cast to `Array<keyof T>`.
 * @example
 * const keys = getContractTypeNames<{ a: string; b: number }>();
 * // keys: Array<'a' | 'b'>
 */
export function getContractTypeNames<T>(): Array<keyof T> {
  return [] as Array<keyof T>;
}
