import { SemanticVersionFactory } from './SemanticVersionBuilderFactory';
import { SemanticVersionBuilder } from './SemanticVersionBuilder';

jest.mock('./SemanticVersionBuilder');

describe('SemanticVersionFactory', () => {
  let mockBuilder: any;

  beforeEach(() => {
    mockBuilder = {
      withMaxLength: jest.fn().mockReturnThis(),
      withControlCharacters: jest.fn().mockReturnThis(),
      withMaxVersionNumber: jest.fn().mockReturnThis(),
      withCustomRegex: jest.fn().mockReturnThis(),
      build: jest.fn().mockReturnValue('mockVersionService'),
    };

    (SemanticVersionBuilder.fromVersion as jest.Mock).mockReturnValue(mockBuilder);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createDevelopment', () => {
    it('should create semantic version with development configuration', () => {
      const result = SemanticVersionFactory.createDevelopment('1.0.0');

      expect(SemanticVersionBuilder.fromVersion).toHaveBeenCalledWith('1.0.0');
      expect(mockBuilder.withMaxLength).toHaveBeenCalledWith(500);
      expect(mockBuilder.withControlCharacters).toHaveBeenCalledWith(true);
      expect(mockBuilder.build).toHaveBeenCalled();
      expect(result).toBe('mockVersionService');
    });
  });

  describe('createProduction', () => {
    it('should create semantic version with production configuration', () => {
      const result = SemanticVersionFactory.createProduction('2.0.0');

      expect(SemanticVersionBuilder.fromVersion).toHaveBeenCalledWith('2.0.0');
      expect(mockBuilder.withMaxLength).toHaveBeenCalledWith(256);
      expect(mockBuilder.withControlCharacters).toHaveBeenCalledWith(false);
      expect(mockBuilder.withMaxVersionNumber).toHaveBeenCalledWith(999999);
      expect(mockBuilder.build).toHaveBeenCalled();
      expect(result).toBe('mockVersionService');
    });
  });

  describe('createStrict', () => {
    it('should create semantic version with strict configuration', () => {
      const result = SemanticVersionFactory.createStrict('3.0.0');
      const strictRegex = /^(\d+)\.(\d+)\.(\d+)$/;

      expect(SemanticVersionBuilder.fromVersion).toHaveBeenCalledWith('3.0.0');
      expect(mockBuilder.withCustomRegex).toHaveBeenCalledWith(strictRegex);
      expect(mockBuilder.withMaxVersionNumber).toHaveBeenCalledWith(999);
      expect(mockBuilder.build).toHaveBeenCalled();
      expect(result).toBe('mockVersionService');
    });
  });
});
