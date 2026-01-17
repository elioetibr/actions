import { IBuilder } from './interfaces';
export declare abstract class BaseBuilder<T, B extends BaseBuilder<T, B>> implements IBuilder<T> {
    abstract build(): T;
    protected abstract getSelf(): B;
}
export declare class MapBuilder<K, V> extends BaseBuilder<Map<K, V>, MapBuilder<K, V>> {
    private readonly map;
    constructor(initialMap?: Map<K, V>);
    get size(): number;
    add<T extends MapBuilder<K, V>>(this: T, key: K, value: V): T;
    remove<T extends MapBuilder<K, V>>(this: T, key: K): T;
    clear<T extends MapBuilder<K, V>>(this: T): T;
    build(): Map<K, V>;
    has(key: K): boolean;
    getValue(key: K): V | undefined;
    protected getSelf(): MapBuilder<K, V>;
}
export declare class ArrayBuilder<T> extends BaseBuilder<T[], ArrayBuilder<T>> {
    private array;
    constructor(initialArray?: T[]);
    get length(): number;
    add<B extends ArrayBuilder<T>>(this: B, item: T): B;
    addAll<B extends ArrayBuilder<T>>(this: B, items: T[]): B;
    remove<B extends ArrayBuilder<T>>(this: B, index: number): B;
    clear<B extends ArrayBuilder<T>>(this: B): B;
    build(): T[];
    protected getSelf(): ArrayBuilder<T>;
}
export declare class SetBuilder<T> extends BaseBuilder<Set<T>, SetBuilder<T>> {
    readonly set: Set<T>;
    constructor(initialSet?: Set<T>);
    get size(): number;
    add<B extends SetBuilder<T>>(this: B, item: T): B;
    addAll<B extends SetBuilder<T>>(this: B, items: T[]): B;
    remove<B extends SetBuilder<T>>(this: B, item: T): B;
    clear<B extends SetBuilder<T>>(this: B): B;
    build(): Set<T>;
    has(item: T): boolean;
    protected getSelf(): SetBuilder<T>;
}
export declare function mapBuilder<K, V>(initialMap?: Map<K, V>): MapBuilder<K, V>;
export declare function arrayBuilder<T>(initialArray?: T[]): ArrayBuilder<T>;
export declare function setBuilder<T>(initialSet?: Set<T>): SetBuilder<T>;
//# sourceMappingURL=BuilderTypes.d.ts.map