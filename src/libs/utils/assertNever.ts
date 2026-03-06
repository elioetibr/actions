/**
 * Exhaustive check utility for discriminated unions.
 * Use as the default case in switch statements to ensure
 * all variants are handled at compile time.
 *
 * @param value - The value that should be of type `never` if all cases are covered
 * @throws Error if reached at runtime (indicates a missing case)
 */
export function assertNever(value: never): never {
  throw new Error(`Unexpected value: ${JSON.stringify(value)}`);
}
