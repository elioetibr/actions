/**
 * Add an item to an array only if it is not already present.
 * Uses `Array.includes()` for lookup — O(n) per call. Suitable for small
 * collections (CLI flag lists, file paths). For large or hot-path sets,
 * prefer a `Set<T>` instead.
 * @param array - The target array (mutated in place)
 * @param item  - The item to add
 */
export function addUnique<T>(array: T[], item: T): void {
  if (!array.includes(item)) {
    array.push(item);
  }
}

/**
 * Remove the first occurrence of an item from an array.
 * @param array - The target array (mutated in place)
 * @param item  - The item to remove
 * @returns `true` if the item was found and removed, `false` otherwise
 */
export function removeItem<T>(array: T[], item: T): boolean {
  const index = array.indexOf(item);
  if (index !== -1) {
    array.splice(index, 1);
    return true;
  }
  return false;
}
