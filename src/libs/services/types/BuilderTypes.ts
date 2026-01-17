// Generic services base class
import { IBuilder } from './interfaces';

export abstract class BaseBuilder<T, B extends BaseBuilder<T, B>> implements IBuilder<T> {
  abstract build(): T;

  protected abstract getSelf(): B;
}

// Map Builder extending the generic services
export class MapBuilder<K, V> extends BaseBuilder<Map<K, V>, MapBuilder<K, V>> {
  private readonly map: Map<K, V>;

  constructor(initialMap?: Map<K, V>) {
    super();
    this.map = initialMap || new Map<K, V>();
  }

  get size(): number {
    return this.map.size;
  }

  add<T extends MapBuilder<K, V>>(this: T, key: K, value: V): T {
    this.map.set(key, value);
    return this;
  }

  remove<T extends MapBuilder<K, V>>(this: T, key: K): T {
    this.map.delete(key);
    return this;
  }

  clear<T extends MapBuilder<K, V>>(this: T): T {
    this.map.clear();
    return this;
  }

  build(): Map<K, V> {
    return new Map(this.map);
  }

  has(key: K): boolean {
    return this.map.has(key);
  }

  getValue(key: K): V | undefined {
    return this.map.get(key);
  }

  protected getSelf(): MapBuilder<K, V> {
    return this;
  }
}

// Array Builder example
export class ArrayBuilder<T> extends BaseBuilder<T[], ArrayBuilder<T>> {
  private array: T[];

  constructor(initialArray?: T[]) {
    super();
    this.array = initialArray || [];
  }

  get length(): number {
    return this.array.length;
  }

  add<B extends ArrayBuilder<T>>(this: B, item: T): B {
    this.array.push(item);
    return this;
  }

  addAll<B extends ArrayBuilder<T>>(this: B, items: T[]): B {
    this.array.push(...items);
    return this;
  }

  remove<B extends ArrayBuilder<T>>(this: B, index: number): B {
    this.array.splice(index, 1);
    return this;
  }

  clear<B extends ArrayBuilder<T>>(this: B): B {
    this.array = [];
    return this;
  }

  build(): T[] {
    return [...this.array];
  }

  protected getSelf(): ArrayBuilder<T> {
    return this;
  }
}

// Set Builder example
export class SetBuilder<T> extends BaseBuilder<Set<T>, SetBuilder<T>> {
  readonly set: Set<T>;

  constructor(initialSet?: Set<T>) {
    super();
    this.set = initialSet || new Set<T>();
  }

  get size(): number {
    return this.set.size;
  }

  add<B extends SetBuilder<T>>(this: B, item: T): B {
    this.set.add(item);
    return this;
  }

  addAll<B extends SetBuilder<T>>(this: B, items: T[]): B {
    items.forEach(item => this.set.add(item));
    return this;
  }

  remove<B extends SetBuilder<T>>(this: B, item: T): B {
    this.set.delete(item);
    return this;
  }

  clear<B extends SetBuilder<T>>(this: B): B {
    this.set.clear();
    return this;
  }

  build(): Set<T> {
    return new Set(this.set);
  }

  has(item: T): boolean {
    return this.set.has(item);
  }

  protected getSelf(): SetBuilder<T> {
    return this;
  }
}

// Factory functions
export function mapBuilder<K, V>(initialMap?: Map<K, V>): MapBuilder<K, V> {
  return new MapBuilder<K, V>(initialMap);
}

export function arrayBuilder<T>(initialArray?: T[]): ArrayBuilder<T> {
  return new ArrayBuilder<T>(initialArray);
}

export function setBuilder<T>(initialSet?: Set<T>): SetBuilder<T> {
  return new SetBuilder<T>(initialSet);
}

// // Usage examples:
//
// // Map Builder
// const map = mapBuilder<string, number>()
//     .add("one", 1)
//     .add("two", 2)
//     .add("three", 3)
//     .remove("two")
//     .build();
//
// console.log(map); // Map(2) { 'one' => 1, 'three' => 3 }
//
// // Array Builder
// const array = arrayBuilder<string>()
//     .add("hello")
//     .add("world")
//     .addAll(["foo", "bar"])
//     .remove(1) // removes "world"
//     .build();
//
// console.log(array); // ['hello', 'foo', 'bar']
//
// // Set Builder
// const set = setBuilder<number>()
//     .add(1)
//     .add(2)
//     .add(3)
//     .add(2) // duplicate, won't be added
//     .addAll([4, 5, 6])
//     .build();
//
// console.log(set); // Set(6) { 1, 2, 3, 4, 5, 6 }
//
// // Chaining with type preservation
// class ExtendedMapBuilder<K, V> extends MapBuilder<K, V> {
//     addMultiple<T extends ExtendedMapBuilder<K, V>>(this: T, entries: [K, V][]): T {
//         entries.forEach(([key, value]) => this.add(key, value));
//         return this;
//     }
// }
//
// const extendedMap = new ExtendedMapBuilder<string, number>()
//     .add("a", 1)
//     .addMultiple([["b", 2], ["c", 3]])
//     .add("d", 4)
//     .build();
//
// console.log(extendedMap); // Map(4) { 'a' => 1, 'b' => 2, 'c' => 3, 'd' => 4 }
