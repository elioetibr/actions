import { addUnique, removeItem } from './arrays';

describe('addUnique', () => {
  test('adds a new item to the array', () => {
    const arr = [1, 2, 3];
    addUnique(arr, 4);
    expect(arr).toEqual([1, 2, 3, 4]);
  });

  test('does not add a duplicate item', () => {
    const arr = ['a', 'b'];
    addUnique(arr, 'b');
    expect(arr).toEqual(['a', 'b']);
  });

  test('works with an empty array', () => {
    const arr: number[] = [];
    addUnique(arr, 1);
    expect(arr).toEqual([1]);
  });

  test('adds first occurrence only for reference equality', () => {
    const arr = [1, 2];
    addUnique(arr, 1);
    addUnique(arr, 3);
    expect(arr).toEqual([1, 2, 3]);
  });
});

describe('removeItem', () => {
  test('removes an existing item and returns true', () => {
    const arr = ['x', 'y', 'z'];
    const result = removeItem(arr, 'y');
    expect(result).toBe(true);
    expect(arr).toEqual(['x', 'z']);
  });

  test('returns false when item is not present', () => {
    const arr = [1, 2, 3];
    const result = removeItem(arr, 99);
    expect(result).toBe(false);
    expect(arr).toEqual([1, 2, 3]);
  });

  test('works with an empty array', () => {
    const arr: string[] = [];
    const result = removeItem(arr, 'nope');
    expect(result).toBe(false);
    expect(arr).toEqual([]);
  });

  test('removes only the first occurrence', () => {
    const arr = [1, 2, 1, 3];
    removeItem(arr, 1);
    expect(arr).toEqual([2, 1, 3]);
  });
});
