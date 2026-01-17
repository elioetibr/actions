// Mock the IBuilder interface
import {
  ArrayBuilder,
  BaseBuilder,
  MapBuilder,
  SetBuilder,
  arrayBuilder,
  mapBuilder,
  setBuilder,
} from './BuilderTypes';

// Create a concrete test implementation of BaseBuilder for testing
class TestBaseBuilder extends BaseBuilder<string, TestBaseBuilder> {
  private value: string;

  constructor(initialValue: string = '') {
    super();
    this.value = initialValue;
  }

  setValue(value: string): TestBaseBuilder {
    this.value = value;
    return this;
  }

  getValue(): string {
    return this.value;
  }

  build(): string {
    return this.value;
  }

  protected getSelf(): TestBaseBuilder {
    return this;
  }
}

describe('Builder Classes', () => {
  describe('BaseBuilder Abstract Class', () => {
    let testBuilder: TestBaseBuilder;

    beforeEach(() => {
      testBuilder = new TestBaseBuilder('initial');
    });

    it('should be an abstract class that can be extended', () => {
      expect(testBuilder).toBeInstanceOf(BaseBuilder);
      expect(testBuilder).toBeInstanceOf(TestBaseBuilder);
    });

    it('should implement IBuilder interface through abstract build method', () => {
      expect(typeof testBuilder.build).toBe('function');
      expect(testBuilder.build()).toBe('initial');
    });

    it('should provide getSelf method for method chaining', () => {
      const result = testBuilder.setValue('new value');
      expect(result).toBe(testBuilder);
      expect(testBuilder.getValue()).toBe('new value');
    });

    it('should maintain type safety in generic inheritance', () => {
      const builder: BaseBuilder<string, TestBaseBuilder> = testBuilder;
      expect(builder.build()).toBe('initial');
    });

    it('should support method chaining through getSelf', () => {
      const result = testBuilder.setValue('first').setValue('second').setValue('final');

      expect(result).toBe(testBuilder);
      expect(testBuilder.build()).toBe('final');
    });
  });

  describe('MapBuilder', () => {
    let builder: MapBuilder<string, number>;

    beforeEach(() => {
      builder = new MapBuilder<string, number>();
    });

    describe('BaseBuilder inheritance', () => {
      it('should extend BaseBuilder', () => {
        expect(builder).toBeInstanceOf(BaseBuilder);
        expect(builder).toBeInstanceOf(MapBuilder);
      });

      it('should implement build method from BaseBuilder', () => {
        const result = builder.build();
        expect(result).toBeInstanceOf(Map);
      });

      it('should implement getSelf method from BaseBuilder', () => {
        expect(builder['getSelf']()).toBe(builder);
      });
    });

    describe('Constructor', () => {
      it('should initialize with empty map when no initial map provided', () => {
        const builder = new MapBuilder<string, number>();
        expect(builder.size).toBe(0);
      });

      it('should initialize with provided initial map', () => {
        const initialMap = new Map([
          ['key1', 1],
          ['key2', 2],
        ]);
        const builder = new MapBuilder<string, number>(initialMap);
        expect(builder.size).toBe(2);
        expect(builder.has('key1')).toBe(true);
        expect(builder.getValue('key1')).toBe(1);
      });

      it('should call super() constructor', () => {
        const builder = new MapBuilder<string, number>();
        expect(builder).toBeInstanceOf(BaseBuilder);
      });
    });

    describe('size getter', () => {
      it('should return 0 for empty map', () => {
        expect(builder.size).toBe(0);
      });

      it('should return correct size after adding items', () => {
        builder.add('key1', 1).add('key2', 2);
        expect(builder.size).toBe(2);
      });
    });

    describe('add method', () => {
      it('should add key-value pair and return self for chaining', () => {
        const result = builder.add('key1', 100);
        expect(result).toBe(builder);
        expect(builder.has('key1')).toBe(true);
        expect(builder.getValue('key1')).toBe(100);
        expect(builder.size).toBe(1);
      });

      it('should update existing key with new value', () => {
        builder.add('key1', 100);
        builder.add('key1', 200);
        expect(builder.getValue('key1')).toBe(200);
        expect(builder.size).toBe(1);
      });

      it('should handle different data types', () => {
        const stringBuilder = new MapBuilder<number, string>();
        stringBuilder.add(1, 'one').add(2, 'two');
        expect(stringBuilder.getValue(1)).toBe('one');
        expect(stringBuilder.getValue(2)).toBe('two');
      });

      it('should preserve generic type T in method signature', () => {
        class ExtendedMapBuilder<K, V> extends MapBuilder<K, V> {
          addMultiple<T extends ExtendedMapBuilder<K, V>>(this: T, entries: [K, V][]): T {
            entries.forEach(([key, value]) => this.add(key, value));
            return this;
          }
        }

        const extendedBuilder = new ExtendedMapBuilder<string, number>();
        const result = extendedBuilder
          .add('a', 1)
          .addMultiple([
            ['b', 2],
            ['c', 3],
          ])
          .add('d', 4);

        expect(result).toBe(extendedBuilder);
        expect(extendedBuilder.size).toBe(4);
      });
    });

    describe('remove method', () => {
      it('should remove existing key and return self for chaining', () => {
        builder.add('key1', 1).add('key2', 2);
        const result = builder.remove('key1');
        expect(result).toBe(builder);
        expect(builder.has('key1')).toBe(false);
        expect(builder.size).toBe(1);
      });

      it('should handle removal of non-existing key', () => {
        const result = builder.remove('nonExistent');
        expect(result).toBe(builder);
        expect(builder.size).toBe(0);
      });
    });

    describe('clear method', () => {
      it('should clear all entries and return self for chaining', () => {
        builder.add('key1', 1).add('key2', 2);
        const result = builder.clear();
        expect(result).toBe(builder);
        expect(builder.size).toBe(0);
      });

      it('should work on already empty map', () => {
        const result = builder.clear();
        expect(result).toBe(builder);
        expect(builder.size).toBe(0);
      });
    });

    describe('build method', () => {
      it('should return a new Map with copied entries', () => {
        builder.add('key1', 1).add('key2', 2);
        const result = builder.build();
        expect(result).toBeInstanceOf(Map);
        expect(result).not.toBe(builder['map']); // Should be a new instance
        expect(result.size).toBe(2);
        expect(result.get('key1')).toBe(1);
        expect(result.get('key2')).toBe(2);
      });

      it('should return empty map when no entries added', () => {
        const result = builder.build();
        expect(result.size).toBe(0);
      });

      it('should not affect original services when modifying built map', () => {
        builder.add('key1', 1);
        const result = builder.build();
        result.set('key2', 2);
        expect(builder.size).toBe(1);
        expect(builder.has('key2')).toBe(false);
      });
    });

    describe('has method', () => {
      it('should return true for existing key', () => {
        builder.add('key1', 1);
        expect(builder.has('key1')).toBe(true);
      });

      it('should return false for non-existing key', () => {
        expect(builder.has('nonExistent')).toBe(false);
      });
    });

    describe('getValue method', () => {
      it('should return value for existing key', () => {
        builder.add('key1', 42);
        expect(builder.getValue('key1')).toBe(42);
      });

      it('should return undefined for non-existing key', () => {
        expect(builder.getValue('nonExistent')).toBeUndefined();
      });
    });

    describe('getSelf method', () => {
      it('should return self instance', () => {
        expect(builder['getSelf']()).toBe(builder);
      });
    });

    describe('Method chaining', () => {
      it('should support complex chaining operations', () => {
        const result = builder.add('a', 1).add('b', 2).add('c', 3).remove('b').add('d', 4).build();

        expect(result.size).toBe(3);
        expect(result.has('a')).toBe(true);
        expect(result.has('b')).toBe(false);
        expect(result.has('c')).toBe(true);
        expect(result.has('d')).toBe(true);
      });
    });
  });

  describe('ArrayBuilder', () => {
    let builder: ArrayBuilder<string>;

    beforeEach(() => {
      builder = new ArrayBuilder<string>();
    });

    describe('BaseBuilder inheritance', () => {
      it('should extend BaseBuilder', () => {
        expect(builder).toBeInstanceOf(BaseBuilder);
        expect(builder).toBeInstanceOf(ArrayBuilder);
      });

      it('should implement build method from BaseBuilder', () => {
        const result = builder.build();
        expect(Array.isArray(result)).toBe(true);
      });

      it('should implement getSelf method from BaseBuilder', () => {
        expect(builder['getSelf']()).toBe(builder);
      });
    });

    describe('Constructor', () => {
      it('should initialize with empty array when no initial array provided', () => {
        const builder = new ArrayBuilder<string>();
        expect(builder.length).toBe(0);
      });

      it('should initialize with provided initial array', () => {
        const initialArray = ['a', 'b', 'c'];
        const builder = new ArrayBuilder<string>(initialArray);
        expect(builder.length).toBe(3);
      });

      it('should call super() constructor', () => {
        const builder = new ArrayBuilder<string>();
        expect(builder).toBeInstanceOf(BaseBuilder);
      });
    });

    describe('length getter', () => {
      it('should return 0 for empty array', () => {
        expect(builder.length).toBe(0);
      });

      it('should return correct length after adding items', () => {
        builder.add('item1').add('item2');
        expect(builder.length).toBe(2);
      });
    });

    describe('add method', () => {
      it('should add item and return self for chaining', () => {
        const result = builder.add('item1');
        expect(result).toBe(builder);
        expect(builder.length).toBe(1);
      });

      it('should add items in order', () => {
        builder.add('first').add('second').add('third');
        const result = builder.build();
        expect(result).toEqual(['first', 'second', 'third']);
      });

      it('should preserve generic type B in method signature', () => {
        class ExtendedArrayBuilder<T> extends ArrayBuilder<T> {
          addRange<B extends ExtendedArrayBuilder<T>>(this: B, start: T, end: T): B {
            this.add(start).add(end);
            return this;
          }
        }

        const extendedBuilder = new ExtendedArrayBuilder<string>();
        const result = extendedBuilder.add('a').addRange('b', 'c').add('d');

        expect(result).toBe(extendedBuilder);
        expect(extendedBuilder.length).toBe(4);
      });
    });

    describe('addAll method', () => {
      it('should add all items from array and return self for chaining', () => {
        const result = builder.addAll(['a', 'b', 'c']);
        expect(result).toBe(builder);
        expect(builder.length).toBe(3);
      });

      it('should add items to existing array', () => {
        builder.add('first');
        builder.addAll(['second', 'third']);
        const result = builder.build();
        expect(result).toEqual(['first', 'second', 'third']);
      });

      it('should handle empty array', () => {
        const result = builder.addAll([]);
        expect(result).toBe(builder);
        expect(builder.length).toBe(0);
      });
    });

    describe('remove method', () => {
      it('should remove item at index and return self for chaining', () => {
        builder.addAll(['a', 'b', 'c']);
        const result = builder.remove(1);
        expect(result).toBe(builder);
        expect(builder.length).toBe(2);
        expect(builder.build()).toEqual(['a', 'c']);
      });

      it('should handle removal at index 0', () => {
        builder.addAll(['a', 'b', 'c']);
        builder.remove(0);
        expect(builder.build()).toEqual(['b', 'c']);
      });

      it('should handle removal at last index', () => {
        builder.addAll(['a', 'b', 'c']);
        builder.remove(2);
        expect(builder.build()).toEqual(['a', 'b']);
      });

      it('should handle invalid index gracefully', () => {
        builder.addAll(['a', 'b']);
        builder.remove(5); // Out of bounds
        expect(builder.build()).toEqual(['a', 'b']);
      });
    });

    describe('clear method', () => {
      it('should clear all items and return self for chaining', () => {
        builder.addAll(['a', 'b', 'c']);
        const result = builder.clear();
        expect(result).toBe(builder);
        expect(builder.length).toBe(0);
      });

      it('should work on already empty array', () => {
        const result = builder.clear();
        expect(result).toBe(builder);
        expect(builder.length).toBe(0);
      });
    });

    describe('build method', () => {
      it('should return a new array with copied elements', () => {
        builder.addAll(['a', 'b', 'c']);
        const result = builder.build();
        expect(result).toEqual(['a', 'b', 'c']);
        expect(result).not.toBe(builder['array']); // Should be a new instance
      });

      it('should return empty array when no items added', () => {
        const result = builder.build();
        expect(result).toEqual([]);
      });

      it('should not affect original services when modifying built array', () => {
        builder.add('item1');
        const result = builder.build();
        result.push('item2');
        expect(builder.length).toBe(1);
      });
    });

    describe('getSelf method', () => {
      it('should return self instance', () => {
        expect(builder['getSelf']()).toBe(builder);
      });
    });

    describe('Method chaining', () => {
      it('should support complex chaining operations', () => {
        const result = builder
          .add('first')
          .addAll(['second', 'third', 'fourth'])
          .remove(2) // Remove 'third'
          .add('fifth')
          .build();

        expect(result).toEqual(['first', 'second', 'fourth', 'fifth']);
      });
    });
  });

  describe('SetBuilder', () => {
    let builder: SetBuilder<number>;

    beforeEach(() => {
      builder = new SetBuilder<number>();
    });

    describe('BaseBuilder inheritance', () => {
      it('should extend BaseBuilder', () => {
        expect(builder).toBeInstanceOf(BaseBuilder);
        expect(builder).toBeInstanceOf(SetBuilder);
      });

      it('should implement build method from BaseBuilder', () => {
        const result = builder.build();
        expect(result).toBeInstanceOf(Set);
      });

      it('should implement getSelf method from BaseBuilder', () => {
        expect(builder['getSelf']()).toBe(builder);
      });
    });

    describe('Constructor', () => {
      it('should initialize with empty set when no initial set provided', () => {
        const builder = new SetBuilder<number>();
        expect(builder.size).toBe(0);
      });

      it('should initialize with provided initial set', () => {
        const initialSet = new Set([1, 2, 3]);
        const builder = new SetBuilder<number>(initialSet);
        expect(builder.size).toBe(3);
        expect(builder.has(1)).toBe(true);
      });

      it('should call super() constructor', () => {
        const builder = new SetBuilder<number>();
        expect(builder).toBeInstanceOf(BaseBuilder);
      });
    });

    describe('size getter', () => {
      it('should return 0 for empty set', () => {
        expect(builder.size).toBe(0);
      });

      it('should return correct size after adding items', () => {
        builder.add(1).add(2);
        expect(builder.size).toBe(2);
      });
    });

    describe('add method', () => {
      it('should add item and return self for chaining', () => {
        const result = builder.add(1);
        expect(result).toBe(builder);
        expect(builder.has(1)).toBe(true);
        expect(builder.size).toBe(1);
      });

      it('should not add duplicate items', () => {
        builder.add(1).add(1).add(1);
        expect(builder.size).toBe(1);
      });

      it('should preserve generic type B in method signature', () => {
        class ExtendedSetBuilder<T> extends SetBuilder<T> {
          addSequence<B extends ExtendedSetBuilder<T>>(this: B, items: T[]): B {
            items.forEach(item => this.add(item));
            return this;
          }
        }

        const extendedBuilder = new ExtendedSetBuilder<number>();
        const result = extendedBuilder.add(1).addSequence([2, 3, 4]).add(5);

        expect(result).toBe(extendedBuilder);
        expect(extendedBuilder.size).toBe(5);
      });
    });

    describe('addAll method', () => {
      it('should add all items from array and return self for chaining', () => {
        const result = builder.addAll([1, 2, 3]);
        expect(result).toBe(builder);
        expect(builder.size).toBe(3);
      });

      it('should handle duplicates in input array', () => {
        builder.addAll([1, 2, 2, 3, 3, 3]);
        expect(builder.size).toBe(3);
        expect(builder.has(1)).toBe(true);
        expect(builder.has(2)).toBe(true);
        expect(builder.has(3)).toBe(true);
      });

      it('should add to existing set', () => {
        builder.add(1);
        builder.addAll([2, 3]);
        expect(builder.size).toBe(3);
      });

      it('should handle empty array', () => {
        const result = builder.addAll([]);
        expect(result).toBe(builder);
        expect(builder.size).toBe(0);
      });

      it('should handle duplicates between existing and new items', () => {
        builder.add(1).add(2);
        builder.addAll([2, 3, 4]);
        expect(builder.size).toBe(4);
      });
    });

    describe('remove method', () => {
      it('should remove existing item and return self for chaining', () => {
        builder.addAll([1, 2, 3]);
        const result = builder.remove(2);
        expect(result).toBe(builder);
        expect(builder.has(2)).toBe(false);
        expect(builder.size).toBe(2);
      });

      it('should handle removal of non-existing item', () => {
        builder.add(1);
        const result = builder.remove(999);
        expect(result).toBe(builder);
        expect(builder.size).toBe(1);
      });
    });

    describe('clear method', () => {
      it('should clear all items and return self for chaining', () => {
        builder.addAll([1, 2, 3]);
        const result = builder.clear();
        expect(result).toBe(builder);
        expect(builder.size).toBe(0);
      });

      it('should work on already empty set', () => {
        const result = builder.clear();
        expect(result).toBe(builder);
        expect(builder.size).toBe(0);
      });
    });

    describe('build method', () => {
      it('should return a new Set with copied elements', () => {
        builder.addAll([1, 2, 3]);
        const result = builder.build();
        expect(result).toBeInstanceOf(Set);
        expect(result).not.toBe(builder['set']); // Should be a new instance
        expect(result.size).toBe(3);
        expect(result.has(1)).toBe(true);
        expect(result.has(2)).toBe(true);
        expect(result.has(3)).toBe(true);
      });

      it('should return empty set when no items added', () => {
        const result = builder.build();
        expect(result.size).toBe(0);
      });

      it('should not affect original services when modifying built set', () => {
        builder.add(1);
        const result = builder.build();
        result.add(2);
        expect(builder.size).toBe(1);
        expect(builder.has(2)).toBe(false);
      });
    });

    describe('has method', () => {
      it('should return true for existing item', () => {
        builder.add(42);
        expect(builder.has(42)).toBe(true);
      });

      it('should return false for non-existing item', () => {
        expect(builder.has(999)).toBe(false);
      });
    });

    describe('getSelf method', () => {
      it('should return self instance', () => {
        expect(builder['getSelf']()).toBe(builder);
      });
    });

    describe('Method chaining', () => {
      it('should support complex chaining operations', () => {
        const result = builder
          .add(1)
          .addAll([2, 3, 4, 4, 5]) // 4 is duplicate
          .remove(3)
          .add(6)
          .build();

        expect(result.size).toBe(5);
        expect(result.has(1)).toBe(true);
        expect(result.has(2)).toBe(true);
        expect(result.has(3)).toBe(false);
        expect(result.has(4)).toBe(true);
        expect(result.has(5)).toBe(true);
        expect(result.has(6)).toBe(true);
      });
    });
  });

  describe('Factory Functions', () => {
    describe('mapBuilder', () => {
      it('should create new MapBuilder instance without initial map', () => {
        const builder = mapBuilder<string, number>();
        expect(builder).toBeInstanceOf(MapBuilder);
        expect(builder).toBeInstanceOf(BaseBuilder);
        expect(builder.size).toBe(0);
      });

      it('should create new MapBuilder instance with initial map', () => {
        const initialMap = new Map([
          ['key1', 1],
          ['key2', 2],
        ]);
        const builder = mapBuilder<string, number>(initialMap);
        expect(builder).toBeInstanceOf(MapBuilder);
        expect(builder).toBeInstanceOf(BaseBuilder);
        expect(builder.size).toBe(2);
        expect(builder.has('key1')).toBe(true);
      });
    });

    describe('arrayBuilder', () => {
      it('should create new ArrayBuilder instance without initial array', () => {
        const builder = arrayBuilder<string>();
        expect(builder).toBeInstanceOf(ArrayBuilder);
        expect(builder).toBeInstanceOf(BaseBuilder);
        expect(builder.length).toBe(0);
      });

      it('should create new ArrayBuilder instance with initial array', () => {
        const initialArray = ['a', 'b', 'c'];
        const builder = arrayBuilder<string>(initialArray);
        expect(builder).toBeInstanceOf(ArrayBuilder);
        expect(builder).toBeInstanceOf(BaseBuilder);
        expect(builder.length).toBe(3);
      });
    });

    describe('setBuilder', () => {
      it('should create new SetBuilder instance without initial set', () => {
        const builder = setBuilder<number>();
        expect(builder).toBeInstanceOf(SetBuilder);
        expect(builder).toBeInstanceOf(BaseBuilder);
        expect(builder.size).toBe(0);
      });

      it('should create new SetBuilder instance with initial set', () => {
        const initialSet = new Set([1, 2, 3]);
        const builder = setBuilder<number>(initialSet);
        expect(builder).toBeInstanceOf(SetBuilder);
        expect(builder).toBeInstanceOf(BaseBuilder);
        expect(builder.size).toBe(3);
        expect(builder.has(1)).toBe(true);
      });
    });
  });

  describe('Type Safety and Generics', () => {
    it('should maintain type safety for MapBuilder', () => {
      const builder = mapBuilder<string, number>();
      builder.add('key', 123); // Should accept string key and number value
      expect(builder.getValue('key')).toBe(123);
    });

    it('should maintain type safety for ArrayBuilder', () => {
      const builder = arrayBuilder<boolean>();
      builder.add(true).add(false);
      expect(builder.build()).toEqual([true, false]);
    });

    it('should maintain type safety for SetBuilder', () => {
      const builder = setBuilder<string>();
      builder.addAll(['a', 'b', 'c']);
      expect(builder.has('a')).toBe(true);
    });

    it('should preserve generic types through inheritance', () => {
      const mapBuilder: BaseBuilder<
        Map<string, number>,
        MapBuilder<string, number>
      > = new MapBuilder<string, number>();
      const arrayBuilder: BaseBuilder<string[], ArrayBuilder<string>> = new ArrayBuilder<string>();
      const setBuilder: BaseBuilder<Set<number>, SetBuilder<number>> = new SetBuilder<number>();

      expect(mapBuilder.build()).toBeInstanceOf(Map);
      expect(Array.isArray(arrayBuilder.build())).toBe(true);
      expect(setBuilder.build()).toBeInstanceOf(Set);
    });
  });

  describe('Abstract Class Functionality', () => {
    it('should enforce build method implementation in concrete classes', () => {
      // Test that all concrete classes implement the abstract build method
      expect(typeof new MapBuilder().build).toBe('function');
      expect(typeof new ArrayBuilder().build).toBe('function');
      expect(typeof new SetBuilder().build).toBe('function');
    });

    it('should enforce getSelf method implementation in concrete classes', () => {
      // Test that all concrete classes implement the abstract getSelf method
      const mapBuilder = new MapBuilder<string, number>();
      const arrayBuilder = new ArrayBuilder<string>();
      const setBuilder = new SetBuilder<number>();

      expect(mapBuilder['getSelf']()).toBe(mapBuilder);
      expect(arrayBuilder['getSelf']()).toBe(arrayBuilder);
      expect(setBuilder['getSelf']()).toBe(setBuilder);
    });

    it('should support polymorphic usage through BaseBuilder', () => {
      const builders: BaseBuilder<any, any>[] = [
        new MapBuilder<string, number>(),
        new ArrayBuilder<string>(),
        new SetBuilder<number>(),
      ];

      builders.forEach(builder => {
        expect(typeof builder.build).toBe('function');
        expect(builder.build()).toBeDefined();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle null and undefined values in MapBuilder', () => {
      const builder = mapBuilder<string, string | null | undefined>();
      builder.add('null', null).add('undefined', undefined);
      expect(builder.getValue('null')).toBeNull();
      expect(builder.getValue('undefined')).toBeUndefined();
    });

    it('should handle null and undefined values in ArrayBuilder', () => {
      const builder = arrayBuilder<string | null | undefined>();
      builder.addAll(['value', null, undefined]);
      const result = builder.build();
      expect(result).toEqual(['value', null, undefined]);
    });

    it('should handle null and undefined values in SetBuilder', () => {
      const builder = setBuilder<string | null | undefined>();
      builder.addAll(['value', null, undefined]);
      expect(builder.size).toBe(3);
      expect(builder.has(null)).toBe(true);
      expect(builder.has(undefined)).toBe(true);
    });

    it('should handle complex object types', () => {
      interface TestObject {
        id: number;
        name: string;
      }

      const obj1: TestObject = { id: 1, name: 'test1' };
      const obj2: TestObject = { id: 2, name: 'test2' };

      const builder = arrayBuilder<TestObject>();
      builder.addAll([obj1, obj2]);
      const result = builder.build();
      expect(result).toEqual([obj1, obj2]);
    });
  });

  describe('Builder Pattern Integration', () => {
    it('should work with all services in combination', () => {
      // Create a map of arrays
      const mapOfArrays = mapBuilder<string, string[]>()
        .add('fruits', arrayBuilder<string>().addAll(['apple', 'banana']).build())
        .add('colors', arrayBuilder<string>().addAll(['red', 'blue']).build())
        .build();

      expect(mapOfArrays.get('fruits')).toEqual(['apple', 'banana']);
      expect(mapOfArrays.get('colors')).toEqual(['red', 'blue']);

      // Create a set of unique values from all arrays
      const allValues = setBuilder<string>();
      mapOfArrays.forEach(array => {
        allValues.addAll(array);
      });
      const uniqueValues = allValues.build();

      expect(uniqueValues.size).toBe(4);
      expect(uniqueValues.has('apple')).toBe(true);
      expect(uniqueValues.has('red')).toBe(true);
    });

    it('should demonstrate inheritance and polymorphism', () => {
      // Test that all services can be treated as BaseBuilder instances
      const builders = [mapBuilder<string, number>(), arrayBuilder<string>(), setBuilder<number>()];

      // All services should be instances of BaseBuilder
      builders.forEach(builder => {
        expect(builder).toBeInstanceOf(BaseBuilder);
        expect(typeof builder.build).toBe('function');
      });

      // Build different types of collections
      const results = builders.map(builder => builder.build());
      expect(results[0]).toBeInstanceOf(Map);
      expect(Array.isArray(results[1])).toBe(true);
      expect(results[2]).toBeInstanceOf(Set);
    });

    it('should support extended services with additional methods', () => {
      // Extended MapBuilder with additional functionality
      class ExtendedMapBuilder<K, V> extends MapBuilder<K, V> {
        addMultiple<T extends ExtendedMapBuilder<K, V>>(this: T, entries: [K, V][]): T {
          entries.forEach(([key, value]) => this.add(key, value));
          return this;
        }

        getKeys(): K[] {
          const result: K[] = [];
          const builtMap = this.build();
          builtMap.forEach((_, key) => result.push(key));
          return result;
        }
      }

      const extendedBuilder = new ExtendedMapBuilder<string, number>()
        .add('a', 1)
        .addMultiple([
          ['b', 2],
          ['c', 3],
        ])
        .add('d', 4);

      expect(extendedBuilder).toBeInstanceOf(BaseBuilder);
      expect(extendedBuilder).toBeInstanceOf(MapBuilder);
      expect(extendedBuilder).toBeInstanceOf(ExtendedMapBuilder);
      expect(extendedBuilder.size).toBe(4);
      expect(extendedBuilder.getKeys()).toContain('a');
      expect(extendedBuilder.getKeys()).toContain('b');
      expect(extendedBuilder.getKeys()).toContain('c');
      expect(extendedBuilder.getKeys()).toContain('d');

      const finalMap = extendedBuilder.build();
      expect(finalMap.size).toBe(4);
      expect(finalMap.get('a')).toBe(1);
      expect(finalMap.get('b')).toBe(2);
      expect(finalMap.get('c')).toBe(3);
      expect(finalMap.get('d')).toBe(4);
    });
  });

  describe('IBuilder Interface Compliance', () => {
    it('should implement IBuilder interface through BaseBuilder', () => {
      const mapBuilder = new MapBuilder<string, number>();
      const arrayBuilder = new ArrayBuilder<string>();
      const setBuilder = new SetBuilder<number>();

      // All services should have build method from IBuilder interface
      expect(typeof mapBuilder.build).toBe('function');
      expect(typeof arrayBuilder.build).toBe('function');
      expect(typeof setBuilder.build).toBe('function');

      // Build methods should return the correct types
      expect(mapBuilder.build()).toBeInstanceOf(Map);
      expect(Array.isArray(arrayBuilder.build())).toBe(true);
      expect(setBuilder.build()).toBeInstanceOf(Set);
    });

    it('should maintain interface contract through inheritance', () => {
      // Test that BaseBuilder properly implements IBuilder
      const testBuilder = new TestBaseBuilder('test');
      expect(typeof testBuilder.build).toBe('function');
      expect(testBuilder.build()).toBe('test');

      // Test through polymorphic usage
      const builder: any = testBuilder; // Simulating IBuilder interface
      expect(builder.build()).toBe('test');
    });
  });

  describe('Memory Management and Immutability', () => {
    it('should create independent copies in build methods', () => {
      // Test MapBuilder immutability
      const mapBuilder = new MapBuilder<string, number>();
      mapBuilder.add('key1', 1);
      const map1 = mapBuilder.build();
      const map2 = mapBuilder.build();

      expect(map1).not.toBe(map2); // Different instances
      expect(map1.get('key1')).toBe(map2.get('key1')); // Same content

      // Test ArrayBuilder immutability
      const arrayBuilder = new ArrayBuilder<string>();
      arrayBuilder.add('item1');
      const arr1 = arrayBuilder.build();
      const arr2 = arrayBuilder.build();

      expect(arr1).not.toBe(arr2); // Different instances
      expect(arr1).toEqual(arr2); // Same content

      // Test SetBuilder immutability
      const setBuilder = new SetBuilder<number>();
      setBuilder.add(1);
      const set1 = setBuilder.build();
      const set2 = setBuilder.build();

      expect(set1).not.toBe(set2); // Different instances
      expect(set1.has(1)).toBe(set2.has(1)); // Same content
    });

    it('should not affect services when modifying built collections', () => {
      // Test with MapBuilder
      const mapBuilder = new MapBuilder<string, number>();
      mapBuilder.add('original', 1);
      const builtMap = mapBuilder.build();
      builtMap.set('new', 2);

      expect(mapBuilder.has('new')).toBe(false);
      expect(mapBuilder.size).toBe(1);

      // Test with ArrayBuilder
      const arrayBuilder = new ArrayBuilder<string>();
      arrayBuilder.add('original');
      const builtArray = arrayBuilder.build();
      builtArray.push('new');

      expect(arrayBuilder.length).toBe(1);
      expect(arrayBuilder.build()).toEqual(['original']);

      // Test with SetBuilder
      const setBuilder = new SetBuilder<number>();
      setBuilder.add(1);
      const builtSet = setBuilder.build();
      builtSet.add(2);

      expect(setBuilder.has(2)).toBe(false);
      expect(setBuilder.size).toBe(1);
    });
  });

  describe('Performance and Optimization', () => {
    it('should handle large collections efficiently', () => {
      const largeSize = 1000;

      // Test MapBuilder with large dataset
      const mapBuilder = new MapBuilder<number, string>();
      for (let i = 0; i < largeSize; i++) {
        mapBuilder.add(i, `value-${i}`);
      }
      expect(mapBuilder.size).toBe(largeSize);
      const builtMap = mapBuilder.build();
      expect(builtMap.size).toBe(largeSize);

      // Test ArrayBuilder with large dataset
      const arrayBuilder = new ArrayBuilder<number>();
      const largeArray = Array.from({ length: largeSize }, (_, i) => i);
      arrayBuilder.addAll(largeArray);
      expect(arrayBuilder.length).toBe(largeSize);
      const builtArray = arrayBuilder.build();
      expect(builtArray.length).toBe(largeSize);

      // Test SetBuilder with large dataset
      const setBuilder = new SetBuilder<number>();
      setBuilder.addAll(largeArray);
      expect(setBuilder.size).toBe(largeSize);
      const builtSet = setBuilder.build();
      expect(builtSet.size).toBe(largeSize);
    });

    it('should maintain performance with method chaining', () => {
      const chainLength = 100;

      let mapBuilder = new MapBuilder<number, string>();
      for (let i = 0; i < chainLength; i++) {
        mapBuilder = mapBuilder.add(i, `value-${i}`);
      }
      expect(mapBuilder.size).toBe(chainLength);

      let arrayBuilder = new ArrayBuilder<number>();
      for (let i = 0; i < chainLength; i++) {
        arrayBuilder = arrayBuilder.add(i);
      }
      expect(arrayBuilder.length).toBe(chainLength);

      let setBuilder = new SetBuilder<number>();
      for (let i = 0; i < chainLength; i++) {
        setBuilder = setBuilder.add(i);
      }
      expect(setBuilder.size).toBe(chainLength);
    });
  });
});
