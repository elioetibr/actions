import { ValidationUtils } from './ValidationUtils';

describe('ValidationUtils', () => {
  describe('isNullOrUndefined', () => {
    it('should return true for null', () => {
      expect(ValidationUtils.isNullOrUndefined(null)).toBe(true);
    });

    it('should return true for undefined', () => {
      expect(ValidationUtils.isNullOrUndefined(undefined)).toBe(true);
    });

    it('should return false for empty string', () => {
      expect(ValidationUtils.isNullOrUndefined('')).toBe(false);
    });

    it('should return false for non-empty string', () => {
      expect(ValidationUtils.isNullOrUndefined('test')).toBe(false);
    });

    it('should return false for number 0', () => {
      expect(ValidationUtils.isNullOrUndefined(0)).toBe(false);
    });

    it('should return false for boolean false', () => {
      expect(ValidationUtils.isNullOrUndefined(false)).toBe(false);
    });

    it('should return false for empty object', () => {
      expect(ValidationUtils.isNullOrUndefined({})).toBe(false);
    });

    it('should return false for empty array', () => {
      expect(ValidationUtils.isNullOrUndefined([])).toBe(false);
    });
  });

  describe('validateStringInput', () => {
    it('should not throw for valid string', () => {
      expect(() => ValidationUtils.validateStringInput('valid')).not.toThrow();
    });

    it('should not throw for empty string', () => {
      expect(() => ValidationUtils.validateStringInput('')).not.toThrow();
    });

    it('should throw for null with default field name', () => {
      expect(() => ValidationUtils.validateStringInput(null as any))
        .toThrow('Input cannot be null or undefined');
    });

    it('should throw for undefined with default field name', () => {
      expect(() => ValidationUtils.validateStringInput(undefined as any))
        .toThrow('Input cannot be null or undefined');
    });

    it('should throw for null with custom field name', () => {
      expect(() => ValidationUtils.validateStringInput(null as any, 'CustomField'))
        .toThrow('CustomField cannot be null or undefined');
    });

    it('should throw for undefined with custom field name', () => {
      expect(() => ValidationUtils.validateStringInput(undefined as any, 'CustomField'))
        .toThrow('CustomField cannot be null or undefined');
    });
  });

  describe('validateMetaDataInput', () => {
    it('should not throw for valid key and value', () => {
      expect(() => ValidationUtils.validateMetaDataInput('key', 'value')).not.toThrow();
    });

    it('should not throw for empty key and valid value', () => {
      expect(() => ValidationUtils.validateMetaDataInput('', 'value')).not.toThrow();
    });

    it('should not throw for valid key and empty value', () => {
      expect(() => ValidationUtils.validateMetaDataInput('key', '')).not.toThrow();
    });

    it('should throw for null key', () => {
      expect(() => ValidationUtils.validateMetaDataInput(null as any, 'value'))
        .toThrow('Metadata key cannot be null or undefined');
    });

    it('should throw for undefined key', () => {
      expect(() => ValidationUtils.validateMetaDataInput(undefined as any, 'value'))
        .toThrow('Metadata key cannot be null or undefined');
    });

    it('should throw for null value', () => {
      expect(() => ValidationUtils.validateMetaDataInput('key', null as any))
        .toThrow('Metadata value cannot be null or undefined');
    });

    it('should throw for undefined value', () => {
      expect(() => ValidationUtils.validateMetaDataInput('key', undefined as any))
        .toThrow('Metadata value cannot be null or undefined');
    });

    it('should throw for both null key and value', () => {
      expect(() => ValidationUtils.validateMetaDataInput(null as any, null as any))
        .toThrow('Metadata key cannot be null or undefined');
    });
  });

  describe('validateCommand', () => {
    it('should not throw for valid command', () => {
      expect(() => ValidationUtils.validateCommand('create')).not.toThrow();
    });

    it('should not throw for command with leading/trailing spaces', () => {
      expect(() => ValidationUtils.validateCommand('  create  ')).not.toThrow();
    });

    it('should throw for empty string', () => {
      expect(() => ValidationUtils.validateCommand(''))
        .toThrow('Command cannot be empty or null');
    });

    it('should throw for whitespace only string', () => {
      expect(() => ValidationUtils.validateCommand('   '))
        .toThrow('Command cannot be empty or null');
    });

    it('should throw for null', () => {
      expect(() => ValidationUtils.validateCommand(null as any))
        .toThrow('Command cannot be empty or null');
    });

    it('should throw for undefined', () => {
      expect(() => ValidationUtils.validateCommand(undefined as any))
        .toThrow('Command cannot be empty or null');
    });
  });
});