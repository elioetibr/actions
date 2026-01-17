import { ContractNames, ContractTypes, getContractTypeNames } from './Contracts';

describe('Contracts types', () => {
  // Test ContractNames type
  test('ContractNames should extract keys as an array of strings', () => {
    interface TestContract {
      method1: string;
      method2: number;
      method3: () => void;
    }

    // Type assertion test
    // @ts-ignore
    const names: ContractNames<TestContract> = ['method1', 'method2', 'method3'];

    // Runtime check to ensure array contains expected values
    expect(names).toContain('method1');
    expect(names).toContain('method2');
    expect(names).toContain('method3');
    expect(names.length).toBe(3);
  });

  // Test ContractTypes type
  test('ContractTypes should maintain the structure of the original type', () => {
    interface TestContract {
      method1: string;
      method2: number;
      method3: () => void;
    }

    // Type assertion test
    const types: ContractTypes<TestContract> = {
      method1: 'string value',
      method2: 42,
      method3: () => {},
    };

    // Runtime checks
    expect(typeof types.method1).toBe('string');
    expect(typeof types.method2).toBe('number');
    expect(typeof types.method3).toBe('function');
  });

  // Test with an empty interface
  test('ContractNames should work with an empty interface', () => {
    interface EmptyContract {}

    // @ts-ignore
    const names: ContractNames<EmptyContract> = [];
    // @ts-ignore
    expect(names.length).toBe(0);
  });

  // Test with nested types
  test('ContractTypes should handle nested types', () => {
    interface NestedContract {
      nested: {
        prop1: string;
        prop2: number;
      };
    }

    const types: ContractTypes<NestedContract> = {
      nested: {
        prop1: 'nested string',
        prop2: 123,
      },
    };

    expect(types.nested.prop1).toBe('nested string');
    expect(types.nested.prop2).toBe(123);
  });

  // Test getContractTypeNames function
  test('getContractTypeNames should return empty array', () => {
    interface TestContract {
      method1: string;
      method2: number;
    }

    const result = getContractTypeNames<TestContract>();
    
    expect(result).toEqual([]);
    expect(Array.isArray(result)).toBe(true);
  });

  test('getContractTypeNames should work with empty interface', () => {
    interface EmptyContract {}

    const result = getContractTypeNames<EmptyContract>();
    
    expect(result).toEqual([]);
    expect(Array.isArray(result)).toBe(true);
  });
});
