import { SemanticVersionBuilder, SemanticVersionInfo } from './SemanticVersionBuilder';

describe('SemanticVersionInfo', () => {
  describe('comparison methods', () => {
    it('isGreaterThan should return true when major version is higher', () => {
      const version1 = new SemanticVersionInfo('2.0.0', '2', '0', '0', '2.0.0', '2.0', '2.0.0', '');
      const version2 = new SemanticVersionInfo('1.0.0', '1', '0', '0', '1.0.0', '1.0', '1.0.0', '');

      expect(version1.isGreaterThan(version2)).toBe(true);
      expect(version2.isGreaterThan(version1)).toBe(false);
    });

    it('isGreaterThan should return true when minor version is higher', () => {
      const version1 = new SemanticVersionInfo('1.2.0', '1', '2', '0', '1.2.0', '1.2', '1.2.0', '');
      const version2 = new SemanticVersionInfo('1.1.0', '1', '1', '0', '1.1.0', '1.1', '1.1.0', '');

      expect(version1.isGreaterThan(version2)).toBe(true);
      expect(version2.isGreaterThan(version1)).toBe(false);
    });

    it('isGreaterThan should return true when patch version is higher', () => {
      const version1 = new SemanticVersionInfo('1.0.5', '1', '0', '5', '1.0.5', '1.0', '1.0.5', '');
      const version2 = new SemanticVersionInfo('1.0.2', '1', '0', '2', '1.0.2', '1.0', '1.0.2', '');

      expect(version1.isGreaterThan(version2)).toBe(true);
      expect(version2.isGreaterThan(version1)).toBe(false);
    });

    it('isGreaterThan should work with string input', () => {
      const version = new SemanticVersionInfo('1.0.0', '1', '0', '0', '1.0.0', '1.0', '1.0.0', '');

      expect(version.isGreaterThan('0.9.9')).toBe(true);
      expect(version.isGreaterThan('1.0.1')).toBe(false);
    });

    it('isLessThan should return true when version is lower', () => {
      const version1 = new SemanticVersionInfo('1.0.0', '1', '0', '0', '1.0.0', '1.0', '1.0.0', '');
      const version2 = new SemanticVersionInfo('2.0.0', '2', '0', '0', '2.0.0', '2.0', '2.0.0', '');

      expect(version1.isLessThan(version2)).toBe(true);
      expect(version2.isLessThan(version1)).toBe(false);
    });

    it('isLessThan should work with string input', () => {
      const version = new SemanticVersionInfo('1.0.0', '1', '0', '0', '1.0.0', '1.0', '1.0.0', '');

      expect(version.isLessThan('1.0.1')).toBe(true);
      expect(version.isLessThan('0.9.9')).toBe(false);
    });

    it('isEqualTo should return true when versions are identical', () => {
      const version1 = new SemanticVersionInfo('1.2.3', '1', '2', '3', '1.2.3', '1.2', '1.2.3', '');
      const version2 = new SemanticVersionInfo('1.2.3', '1', '2', '3', '1.2.3', '1.2', '1.2.3', '');

      expect(version1.isEqualTo(version2)).toBe(true);
    });

    it('isEqualTo should work with string input', () => {
      const version = new SemanticVersionInfo('1.2.3', '1', '2', '3', '1.2.3', '1.2', '1.2.3', '');

      expect(version.isEqualTo('1.2.3')).toBe(true);
      expect(version.isEqualTo('1.2.4')).toBe(false);
    });

    it('isCompatibleWith should return true when major versions match', () => {
      const version1 = new SemanticVersionInfo('1.2.0', '1', '2', '0', '1.2.0', '1.2', '1.2.0', '');
      const version2 = new SemanticVersionInfo('1.3.0', '1', '3', '0', '1.3.0', '1.3', '1.3.0', '');

      expect(version1.isCompatibleWith(version2)).toBe(true);
    });

    it('isCompatibleWith should return false when major versions differ', () => {
      const version1 = new SemanticVersionInfo('1.2.0', '1', '2', '0', '1.2.0', '1.2', '1.2.0', '');
      const version2 = new SemanticVersionInfo('2.0.0', '2', '0', '0', '2.0.0', '2.0', '2.0.0', '');

      expect(version1.isCompatibleWith(version2)).toBe(false);
    });

    it('isCompatibleWith should work with string input', () => {
      const version = new SemanticVersionInfo('1.2.0', '1', '2', '0', '1.2.0', '1.2', '1.2.0', '');

      expect(version.isCompatibleWith('1.3.0')).toBe(true);
      expect(version.isCompatibleWith('2.0.0')).toBe(false);
    });
  });

  describe('manipulation methods', () => {
    it('incrementMajor should increase major version and reset minor and patch', () => {
      const version = new SemanticVersionInfo('1.2.3', '1', '2', '3', '1.2.3', '1.2', '1.2.3', '');
      const newVersion = version.incrementMajor();

      expect(newVersion.semVer).toBe('2.0.0');
      expect(newVersion.major).toBe('2');
      expect(newVersion.minor).toBe('0');
      expect(newVersion.patch).toBe('0');
    });

    it('incrementMajor should preserve suffix', () => {
      const version = new SemanticVersionInfo(
        '1.2.3-beta',
        '1',
        '2',
        '3',
        '1.2.3',
        '1.2',
        '1.2.3',
        '-beta',
      );
      const newVersion = version.incrementMajor();

      expect(newVersion.semVer).toBe('2.0.0-beta');
    });

    it('incrementMinor should increase minor version and reset patch', () => {
      const version = new SemanticVersionInfo('1.2.3', '1', '2', '3', '1.2.3', '1.2', '1.2.3', '');
      const newVersion = version.incrementMinor();

      expect(newVersion.semVer).toBe('1.3.0');
      expect(newVersion.major).toBe('1');
      expect(newVersion.minor).toBe('3');
      expect(newVersion.patch).toBe('0');
    });

    it('incrementMinor should preserve suffix', () => {
      const version = new SemanticVersionInfo(
        '1.2.3-beta',
        '1',
        '2',
        '3',
        '1.2.3',
        '1.2',
        '1.2.3',
        '-beta',
      );
      const newVersion = version.incrementMinor();

      expect(newVersion.semVer).toBe('1.3.0-beta');
    });

    it('incrementPatch should increase patch version', () => {
      const version = new SemanticVersionInfo('1.2.3', '1', '2', '3', '1.2.3', '1.2', '1.2.3', '');
      const newVersion = version.incrementPatch();

      expect(newVersion.semVer).toBe('1.2.4');
      expect(newVersion.major).toBe('1');
      expect(newVersion.minor).toBe('2');
      expect(newVersion.patch).toBe('4');
    });

    it('incrementPatch should preserve suffix', () => {
      const version = new SemanticVersionInfo(
        '1.2.3-beta',
        '1',
        '2',
        '3',
        '1.2.3',
        '1.2',
        '1.2.3',
        '-beta',
      );
      const newVersion = version.incrementPatch();

      expect(newVersion.semVer).toBe('1.2.4-beta');
    });

    it('withSuffix should add the specified suffix', () => {
      const version = new SemanticVersionInfo('1.2.3', '1', '2', '3', '1.2.3', '1.2', '1.2.3', '');
      const newVersion = version.withSuffix('beta');

      expect(newVersion.semVer).toBe('1.2.3-beta');
      expect(newVersion.semVerSuffix).toBe('-beta');
    });

    it('withSuffix should preserve hyphen or plus if already included', () => {
      const version = new SemanticVersionInfo('1.2.3', '1', '2', '3', '1.2.3', '1.2', '1.2.3', '');
      const newVersion = version.withSuffix('-beta');

      expect(newVersion.semVer).toBe('1.2.3-beta');
      expect(newVersion.semVerSuffix).toBe('-beta');
    });

    it('withoutSuffix should remove any suffix', () => {
      const version = new SemanticVersionInfo(
        '1.2.3-beta',
        '1',
        '2',
        '3',
        '1.2.3',
        '1.2',
        '1.2.3',
        '-beta',
      );
      const newVersion = version.withoutSuffix();

      expect(newVersion.semVer).toBe('1.2.3');
      expect(newVersion.semVerSuffix).toBe('');
    });
  });

  describe('utility methods', () => {
    it('isPrerelease should return true for versions with hyphen suffix', () => {
      const version = new SemanticVersionInfo(
        '1.2.3-beta',
        '1',
        '2',
        '3',
        '1.2.3',
        '1.2',
        '1.2.3',
        '-beta',
      );
      expect(version.isPrerelease()).toBe(true);
    });

    it('isPrerelease should return false for versions without suffix', () => {
      const version = new SemanticVersionInfo('1.2.3', '1', '2', '3', '1.2.3', '1.2', '1.2.3', '');
      expect(version.isPrerelease()).toBe(false);
    });

    it('isPrerelease should return false for versions with only build metadata', () => {
      const version = new SemanticVersionInfo(
        '1.2.3+build123',
        '1',
        '2',
        '3',
        '1.2.3',
        '1.2',
        '1.2.3',
        '+build123',
      );
      expect(version.isPrerelease()).toBe(false);
    });

    it('hasBuildMetadata should return true for versions with plus suffix', () => {
      const version = new SemanticVersionInfo(
        '1.2.3+build123',
        '1',
        '2',
        '3',
        '1.2.3',
        '1.2',
        '1.2.3',
        '+build123',
      );
      expect(version.hasBuildMetadata()).toBe(true);
    });

    it('hasBuildMetadata should return false for versions without build metadata', () => {
      const version = new SemanticVersionInfo('1.2.3', '1', '2', '3', '1.2.3', '1.2', '1.2.3', '');
      expect(version.hasBuildMetadata()).toBe(false);
    });

    it('toString should return the semVer string', () => {
      const version = new SemanticVersionInfo(
        '1.2.3-beta',
        '1',
        '2',
        '3',
        '1.2.3',
        '1.2',
        '1.2.3',
        '-beta',
      );
      expect(version.toString()).toBe('1.2.3-beta');
    });

    it('toJSON should return an object with all properties', () => {
      const version = new SemanticVersionInfo(
        '1.2.3-beta',
        '1',
        '2',
        '3',
        '1.2.3',
        '1.2',
        '1.2.3',
        '-beta',
      );
      const json = version.toJSON();

      expect(json).toEqual({
        semVer: '1.2.3-beta',
        major: '1',
        minor: '2',
        patch: '3',
        version: '1.2.3',
        majorMinor: '1.2',
        majorMinorPatch: '1.2.3',
        semVerSuffix: '-beta',
      });
    });
  });
});

describe('SemanticVersionBuilder', () => {
  describe('static factory methods', () => {
    it('create should return a new services instance', () => {
      const builder = SemanticVersionBuilder.create();
      expect(builder).toBeInstanceOf(SemanticVersionBuilder);
    });

    it('fromVersion should create services with version string', () => {
      const builder = SemanticVersionBuilder.fromVersion('1.2.3');
      const service = builder.build();
      expect(service.semVerInfo.semVer).toBe('1.2.3');
    });

    it('fromProvider should create services with version provider', () => {
      const provider = { version: '1.2.3' };
      const builder = SemanticVersionBuilder.fromProvider(provider);
      const service = builder.build();
      expect(service.semVerInfo.semVer).toBe('1.2.3');
    });
  });

  describe('configuration methods', () => {
    it('withVersionProvider should set the version provider', () => {
      const provider = { version: '1.2.3' };
      const service = SemanticVersionBuilder.create().withVersionProvider(provider).build();

      expect(service.semVerInfo.semVer).toBe('1.2.3');
    });

    it('withVersion should set the version string', () => {
      const service = SemanticVersionBuilder.create().withVersion('1.2.3').build();

      expect(service.semVerInfo.semVer).toBe('1.2.3');
    });

    it('withMaxLength should set maximum allowed version length', () => {
      const tooLongVersion = '1.2.34567890';
      expect(() => {
        SemanticVersionBuilder.create().withMaxLength(5).withVersion(tooLongVersion).build();
      }).toThrow('Given Semantic Version is not valid');
    });

    it('withControlCharacters should configure control character handling', () => {
      const versionWithControlChar = '1.2.3\n';
      expect(() => {
        SemanticVersionBuilder.create()
          .withControlCharacters(false)
          .withVersion(versionWithControlChar)
          .build();
      }).toThrow('Given Semantic Version is not valid');
    });

    it('withMaxVersionNumber should set maximum allowed version number', () => {
      const versionWithHighNumber = '11.0.0';
      expect(() => {
        SemanticVersionBuilder.create()
          .withMaxVersionNumber(10)
          .withVersion(versionWithHighNumber)
          .build();
      }).toThrow('Given Semantic Version is not valid');
    });

    it('withCustomRegex should set a custom validation regex', () => {
      const service = SemanticVersionBuilder.create()
        .withCustomRegex(/^(\d+)\.(\d+)\.(\d+)$/)
        .withVersion('1.2.3')
        .build();

      expect(service.semVerInfo.semVer).toBe('1.2.3');
    });

    it('withConfig should apply a configuration object', () => {
      const tooLongVersion = '1.2.34567890';
      expect(() => {
        SemanticVersionBuilder.create()
          .withConfig({ maxLength: 5 })
          .withVersion(tooLongVersion)
          .build();
      }).toThrow('Given Semantic Version is not valid');
    });

    it('build should throw error if no version provider is set', () => {
      expect(() => {
        SemanticVersionBuilder.create().build();
      }).toThrow('Version provider is required');
    });
  });

  describe('createSemVerService', () => {
    it('should create a semantic version service from provider', () => {
      const provider = { version: '1.2.3' };
      const service = SemanticVersionBuilder.fromProvider(provider).build();

      expect(service.semVerInfo.semVer).toBe('1.2.3');
      expect(service.semVerInfo.major).toBe('1');
      expect(service.semVerInfo.minor).toBe('2');
      expect(service.semVerInfo.patch).toBe('3');
    });
  });
});
