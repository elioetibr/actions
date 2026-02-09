import {
  TERRAGRUNT_FLAG_MAP,
  TERRAGRUNT_COMMAND_MAP,
  REMOVED_V1_COMMANDS,
  selectFlag,
  FlagMapping,
} from './TerragruntFlagMapping';

describe('TerragruntFlagMapping', () => {
  describe('TERRAGRUNT_FLAG_MAP', () => {
    test('contains all 17 expected flag keys', () => {
      const expectedKeys = [
        'config',
        'workingDir',
        'noAutoInit',
        'noAutoRetry',
        'nonInteractive',
        'parallelism',
        'includeDir',
        'excludeDir',
        'ignoreDependencyErrors',
        'ignoreExternalDeps',
        'includeExternalDeps',
        'source',
        'sourceMap',
        'downloadDir',
        'iamRole',
        'iamRoleSessionName',
        'strictInclude',
      ];
      for (const key of expectedKeys) {
        expect(TERRAGRUNT_FLAG_MAP).toHaveProperty(key);
      }
      expect(Object.keys(TERRAGRUNT_FLAG_MAP)).toHaveLength(expectedKeys.length);
    });

    test('every entry has both v0 and v1 string values', () => {
      for (const [_key, mapping] of Object.entries(TERRAGRUNT_FLAG_MAP)) {
        expect(typeof mapping.v0).toBe('string');
        expect(typeof mapping.v1).toBe('string');
        expect(mapping.v0.length).toBeGreaterThan(0);
        expect(mapping.v1.length).toBeGreaterThan(0);
        // v0 flags always start with --terragrunt-
        expect(mapping.v0).toMatch(/^--terragrunt-/);
        // v1 flags always start with --
        expect(mapping.v1).toMatch(/^--/);
        // v1 flags should NOT start with --terragrunt-
        expect(mapping.v1).not.toMatch(/^--terragrunt-/);
      }
    });

    test.each([
      ['config', '--terragrunt-config', '--config'],
      ['workingDir', '--terragrunt-working-dir', '--working-dir'],
      ['noAutoInit', '--terragrunt-no-auto-init', '--no-auto-init'],
      ['noAutoRetry', '--terragrunt-no-auto-retry', '--no-auto-retry'],
      ['nonInteractive', '--terragrunt-non-interactive', '--non-interactive'],
      ['parallelism', '--terragrunt-parallelism', '--parallelism'],
      ['includeDir', '--terragrunt-include-dir', '--queue-include-dir'],
      ['excludeDir', '--terragrunt-exclude-dir', '--queue-exclude-dir'],
      ['ignoreDependencyErrors', '--terragrunt-ignore-dependency-errors', '--queue-ignore-errors'],
      [
        'ignoreExternalDeps',
        '--terragrunt-ignore-external-dependencies',
        '--queue-exclude-external',
      ],
      [
        'includeExternalDeps',
        '--terragrunt-include-external-dependencies',
        '--queue-include-external',
      ],
      ['source', '--terragrunt-source', '--source'],
      ['sourceMap', '--terragrunt-source-map', '--source-map'],
      ['downloadDir', '--terragrunt-download-dir', '--download-dir'],
      ['iamRole', '--terragrunt-iam-role', '--iam-role'],
      ['iamRoleSessionName', '--terragrunt-iam-role-session-name', '--iam-role-session-name'],
      ['strictInclude', '--terragrunt-strict-include', '--queue-strict-include'],
    ])('maps "%s" to v0="%s" and v1="%s"', (key, expectedV0, expectedV1) => {
      const mapping = TERRAGRUNT_FLAG_MAP[key] as FlagMapping;
      expect(mapping.v0).toBe(expectedV0);
      expect(mapping.v1).toBe(expectedV1);
    });
  });

  describe('TERRAGRUNT_COMMAND_MAP', () => {
    test('contains all expected renamed commands', () => {
      const expectedKeys = [
        'run-all',
        'graph-dependencies',
        'hclfmt',
        'render-json',
        'output-module-groups',
        'validate-inputs',
      ];
      for (const key of expectedKeys) {
        expect(TERRAGRUNT_COMMAND_MAP).toHaveProperty(key);
      }
      expect(Object.keys(TERRAGRUNT_COMMAND_MAP)).toHaveLength(expectedKeys.length);
    });

    test.each([
      ['run-all', ['run', '--all']],
      ['graph-dependencies', ['dag', 'graph']],
      ['hclfmt', ['hcl', 'fmt']],
      ['render-json', ['render', '--json', '-w']],
      ['output-module-groups', ['find', '--dag', '--json']],
      ['validate-inputs', ['validate', 'inputs']],
    ])('maps v0 command "%s" to v1 tokens %j', (v0Command, expectedTokens) => {
      const tokens = TERRAGRUNT_COMMAND_MAP[v0Command];
      expect(tokens).toEqual(expectedTokens);
    });

    test('every entry is a non-empty array of strings', () => {
      for (const tokens of Object.values(TERRAGRUNT_COMMAND_MAP)) {
        expect(Array.isArray(tokens)).toBe(true);
        expect(tokens.length).toBeGreaterThan(0);
        for (const token of tokens) {
          expect(typeof token).toBe('string');
        }
      }
    });
  });

  describe('REMOVED_V1_COMMANDS', () => {
    test('contains aws-provider-patch', () => {
      expect(REMOVED_V1_COMMANDS).toContain('aws-provider-patch');
    });

    test('is a non-empty array', () => {
      expect(REMOVED_V1_COMMANDS.length).toBeGreaterThan(0);
    });
  });

  describe('selectFlag', () => {
    test('returns v0 flag for majorVersion 0', () => {
      expect(selectFlag('config', 0)).toBe('--terragrunt-config');
    });

    test('returns v1 flag for majorVersion 1', () => {
      expect(selectFlag('config', 1)).toBe('--config');
    });

    test('returns v1 flag for majorVersion >= 2', () => {
      expect(selectFlag('config', 2)).toBe('--config');
    });

    test('throws for unknown flag key', () => {
      expect(() => selectFlag('nonExistentKey', 0)).toThrow(
        'Unknown Terragrunt flag key: nonExistentKey',
      );
    });

    test.each(Object.keys(TERRAGRUNT_FLAG_MAP))(
      'returns v0 flag for key "%s" when version is 0',
      key => {
        const result = selectFlag(key, 0);
        expect(result).toBe(TERRAGRUNT_FLAG_MAP[key]!.v0);
      },
    );

    test.each(Object.keys(TERRAGRUNT_FLAG_MAP))(
      'returns v1 flag for key "%s" when version is 1',
      key => {
        const result = selectFlag(key, 1);
        expect(result).toBe(TERRAGRUNT_FLAG_MAP[key]!.v1);
      },
    );
  });
});
