import { MetaDataManager } from './MetaDataManager';

describe('MetaDataManager', () => {
  let manager: MetaDataManager;

  beforeEach(() => {
    manager = new MetaDataManager();
  });

  describe('constructor', () => {
    it('should initialize with empty metadata', () => {
      expect(manager.getSize()).toBe(0);
      expect(manager.getAllMetaData().size).toBe(0);
    });
  });

  describe('addMetaData', () => {
    it('should add single key-value pair', () => {
      const result = manager.addMetaData('--tag', 'latest');
      
      expect(result).toBe(manager); // Should return self for chaining
      expect(manager.getMetaData('--tag')).toEqual(['latest']);
      expect(manager.getSize()).toBe(1);
    });

    it('should append to existing key', () => {
      manager.addMetaData('--tag', 'latest');
      manager.addMetaData('--tag', 'v1.0.0');
      
      expect(manager.getMetaData('--tag')).toEqual(['latest', 'v1.0.0']);
      expect(manager.getSize()).toBe(1);
    });

    it('should handle empty key', () => {
      manager.addMetaData('', 'source-image');
      
      expect(manager.getMetaData('')).toEqual(['source-image']);
    });

    it('should throw for null key', () => {
      expect(() => manager.addMetaData(null as any, 'value'))
        .toThrow('Metadata key cannot be null or undefined');
    });

    it('should throw for null value', () => {
      expect(() => manager.addMetaData('key', null as any))
        .toThrow('Metadata value cannot be null or undefined');
    });
  });

  describe('setMetaData', () => {
    it('should set single value', () => {
      const result = manager.setMetaData('--tag', 'latest');
      
      expect(result).toBe(manager);
      expect(manager.getMetaData('--tag')).toEqual(['latest']);
    });

    it('should set array of values', () => {
      manager.setMetaData('--tag', ['latest', 'v1.0.0']);
      
      expect(manager.getMetaData('--tag')).toEqual(['latest', 'v1.0.0']);
    });

    it('should replace existing values', () => {
      manager.addMetaData('--tag', 'old');
      manager.setMetaData('--tag', 'new');
      
      expect(manager.getMetaData('--tag')).toEqual(['new']);
    });

    it('should validate all values in array', () => {
      expect(() => manager.setMetaData('key', [null as any, 'valid']))
        .toThrow('Metadata value cannot be null or undefined');
    });
  });

  describe('getMetaData', () => {
    it('should return empty array for non-existent key', () => {
      expect(manager.getMetaData('non-existent')).toEqual([]);
    });

    it('should return existing values', () => {
      manager.addMetaData('--tag', 'value1');
      manager.addMetaData('--tag', 'value2');
      
      expect(manager.getMetaData('--tag')).toEqual(['value1', 'value2']);
    });
  });

  describe('getFirstMetaData', () => {
    it('should return undefined for non-existent key', () => {
      expect(manager.getFirstMetaData('non-existent')).toBeUndefined();
    });

    it('should return first value when multiple exist', () => {
      manager.addMetaData('--tag', 'first');
      manager.addMetaData('--tag', 'second');
      
      expect(manager.getFirstMetaData('--tag')).toBe('first');
    });

    it('should return single value', () => {
      manager.setMetaData('--tag', 'only');
      
      expect(manager.getFirstMetaData('--tag')).toBe('only');
    });

    it('should return undefined for empty values array', () => {
      manager.setMetaData('--tag', []);
      
      expect(manager.getFirstMetaData('--tag')).toBeUndefined();
    });

    it('should handle case where values exist but array is empty', () => {
      // Directly set an empty array to test the branch where values exists but length is 0
      (manager as any).metaData.set('--empty', []);
      
      expect(manager.getFirstMetaData('--empty')).toBeUndefined();
    });
  });

  describe('removeMetaData', () => {
    it('should remove existing key', () => {
      manager.addMetaData('--tag', 'value');
      const result = manager.removeMetaData('--tag');
      
      expect(result).toBe(manager);
      expect(manager.getMetaData('--tag')).toEqual([]);
      expect(manager.getSize()).toBe(0);
    });

    it('should handle removing non-existent key', () => {
      expect(() => manager.removeMetaData('non-existent')).not.toThrow();
      expect(manager.getSize()).toBe(0);
    });
  });

  describe('clearMetaData', () => {
    it('should clear all metadata', () => {
      manager.addMetaData('--tag', 'value1');
      manager.addMetaData('--output', 'value2');
      
      const result = manager.clearMetaData();
      
      expect(result).toBe(manager);
      expect(manager.getSize()).toBe(0);
      expect(manager.getAllMetaData().size).toBe(0);
    });

    it('should handle clearing empty metadata', () => {
      expect(() => manager.clearMetaData()).not.toThrow();
      expect(manager.getSize()).toBe(0);
    });
  });

  describe('getAllMetaData', () => {
    it('should return copy of metadata map', () => {
      manager.addMetaData('--tag', 'value');
      const metaData = manager.getAllMetaData();
      
      expect(metaData.get('--tag')).toEqual(['value']);
      
      // Modifying returned map should not affect original
      metaData.set('new-key', ['new-value']);
      expect(manager.getMetaData('new-key')).toEqual([]);
    });
  });

  describe('getSize', () => {
    it('should return 0 for empty manager', () => {
      expect(manager.getSize()).toBe(0);
    });

    it('should return correct size', () => {
      manager.addMetaData('key1', 'value1');
      manager.addMetaData('key2', 'value2');
      
      expect(manager.getSize()).toBe(2);
    });

    it('should not count multiple values for same key as separate entries', () => {
      manager.addMetaData('--tag', 'value1');
      manager.addMetaData('--tag', 'value2');
      
      expect(manager.getSize()).toBe(1);
    });
  });

  describe('entries', () => {
    it('should return iterator for metadata entries', () => {
      manager.addMetaData('--tag', 'value1');
      manager.addMetaData('--output', 'value2');
      
      const entries = Array.from(manager.entries());
      
      expect(entries).toHaveLength(2);
      expect(entries).toEqual([
        ['--tag', ['value1']],
        ['--output', ['value2']]
      ]);
    });

    it('should return empty iterator for empty manager', () => {
      const entries = Array.from(manager.entries());
      expect(entries).toHaveLength(0);
    });
  });

  describe('method chaining', () => {
    it('should support fluent interface', () => {
      const result = manager
        .addMetaData('--tag', 'latest')
        .addMetaData('--output', 'docker.io')
        .setMetaData('--platform', 'linux/amd64')
        .removeMetaData('--tag')
        .clearMetaData();
      
      expect(result).toBe(manager);
      expect(manager.getSize()).toBe(0);
    });
  });
});