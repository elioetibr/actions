import { BaseIacStringFormatter, ICommandBuilder } from './BaseIacStringFormatter';

describe('BaseIacStringFormatter', () => {
  function createFormatter(command: string[]): BaseIacStringFormatter {
    const builder: ICommandBuilder = { buildCommand: () => command };
    return new BaseIacStringFormatter(builder);
  }

  describe('toStringMultiLineCommand', () => {
    test('returns empty string for empty command array', () => {
      const formatter = createFormatter([]);
      expect(formatter.toStringMultiLineCommand()).toBe('');
    });
  });

  describe('toString', () => {
    test('returns empty string for empty command array', () => {
      const formatter = createFormatter([]);
      expect(formatter.toString()).toBe('');
    });

    test('escapes arguments with special characters', () => {
      const formatter = createFormatter(['terraform', 'plan', 'path with spaces']);
      const result = formatter.toString();
      expect(result).toContain('"path with spaces"');
    });
  });
});
