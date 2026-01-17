import { TerragruntStringFormatter } from './TerragruntStringFormatter';
import { ITerragruntProvider, TerragruntCommand } from '../interfaces';

/**
 * Creates a mock ITerragruntProvider for testing
 */
function createMockProvider(overrides: Partial<ITerragruntProvider> = {}): ITerragruntProvider {
  return {
    command: 'plan' as TerragruntCommand,
    executor: 'terragrunt',
    workingDirectory: '.',
    environment: new Map<string, string>(),
    variables: new Map<string, string>(),
    varFiles: [],
    backendConfig: new Map<string, string>(),
    targets: [],
    autoApprove: false,
    dryRun: false,
    planFile: undefined,
    outFile: undefined,
    noColor: false,
    compactWarnings: false,
    parallelism: undefined,
    lockTimeout: undefined,
    refresh: true,
    reconfigure: false,
    migrateState: false,
    terragruntConfig: undefined,
    terragruntWorkingDir: undefined,
    runAll: false,
    noAutoInit: false,
    noAutoRetry: false,
    nonInteractive: false,
    terragruntParallelism: undefined,
    includeDirs: [],
    excludeDirs: [],
    ignoreDependencyErrors: false,
    ignoreExternalDependencies: false,
    includeExternalDependencies: false,
    terragruntSource: undefined,
    sourceMap: new Map<string, string>(),
    downloadDir: undefined,
    iamRole: undefined,
    iamRoleSessionName: undefined,
    strictInclude: false,
    ...overrides,
  };
}

describe('TerragruntStringFormatter', () => {
  describe('constructor', () => {
    test('creates instance with provider', () => {
      const provider = createMockProvider();
      const formatter = new TerragruntStringFormatter(provider);
      expect(formatter).toBeInstanceOf(TerragruntStringFormatter);
    });
  });

  describe('toString', () => {
    test('generates basic plan command', () => {
      const provider = createMockProvider({ command: 'plan' });
      const formatter = new TerragruntStringFormatter(provider);
      expect(formatter.toString()).toBe('terragrunt plan');
    });

    test('generates run-all plan command', () => {
      const provider = createMockProvider({
        command: 'plan',
        runAll: true,
      });
      const formatter = new TerragruntStringFormatter(provider);
      const result = formatter.toString();
      expect(result).toContain('terragrunt');
      expect(result).toContain('run-all');
      expect(result).toContain('plan');
    });

    test('generates apply command with auto-approve', () => {
      const provider = createMockProvider({
        command: 'apply',
        autoApprove: true,
      });
      const formatter = new TerragruntStringFormatter(provider);
      const result = formatter.toString();
      expect(result).toContain('terragrunt apply');
      expect(result).toContain('-auto-approve');
    });

    test('generates command with terragrunt-specific options', () => {
      const provider = createMockProvider({
        command: 'plan',
        nonInteractive: true,
        noAutoInit: true,
        noAutoRetry: true,
      });
      const formatter = new TerragruntStringFormatter(provider);
      const result = formatter.toString();
      expect(result).toContain('--terragrunt-non-interactive');
      expect(result).toContain('--terragrunt-no-auto-init');
      expect(result).toContain('--terragrunt-no-auto-retry');
    });

    test('escapes arguments with spaces', () => {
      const variables = new Map<string, string>();
      variables.set('message', 'hello world');

      const provider = createMockProvider({
        command: 'plan',
        variables,
      });
      const formatter = new TerragruntStringFormatter(provider);
      const result = formatter.toString();
      expect(result).toContain('"message=hello world"');
    });

    test('escapes arguments with quotes', () => {
      const variables = new Map<string, string>();
      variables.set('message', 'say "hello"');

      const provider = createMockProvider({
        command: 'plan',
        variables,
      });
      const formatter = new TerragruntStringFormatter(provider);
      const result = formatter.toString();
      expect(result).toContain('\\"');
    });

    test('escapes arguments with special shell characters', () => {
      const variables = new Map<string, string>();
      variables.set('script', 'echo $VAR');

      const provider = createMockProvider({
        command: 'plan',
        variables,
      });
      const formatter = new TerragruntStringFormatter(provider);
      const result = formatter.toString();
      expect(result).toContain('"script=echo $VAR"');
    });

    test('escapes arguments with backticks', () => {
      const variables = new Map<string, string>();
      variables.set('cmd', 'value with `backticks`');

      const provider = createMockProvider({
        command: 'plan',
        variables,
      });
      const formatter = new TerragruntStringFormatter(provider);
      const result = formatter.toString();
      expect(result).toContain('"');
    });

    test('escapes arguments with backslashes', () => {
      const variables = new Map<string, string>();
      variables.set('path', 'C:\\Users\\test');

      const provider = createMockProvider({
        command: 'plan',
        variables,
      });
      const formatter = new TerragruntStringFormatter(provider);
      const result = formatter.toString();
      expect(result).toContain('"');
    });

    test('does not escape simple arguments', () => {
      const provider = createMockProvider({
        command: 'plan',
        noColor: true,
      });
      const formatter = new TerragruntStringFormatter(provider);
      const result = formatter.toString();
      expect(result).toContain('-no-color');
      expect(result).not.toContain('"-no-color"');
    });
  });

  describe('toStringMultiLineCommand', () => {
    test('generates multi-line plan command', () => {
      const provider = createMockProvider({ command: 'plan' });
      const formatter = new TerragruntStringFormatter(provider);
      const result = formatter.toStringMultiLineCommand();
      expect(result).toContain('terragrunt \\');
      expect(result).toContain('  plan');
    });

    test('generates multi-line run-all command', () => {
      const provider = createMockProvider({
        command: 'plan',
        runAll: true,
      });
      const formatter = new TerragruntStringFormatter(provider);
      const result = formatter.toStringMultiLineCommand();
      expect(result).toContain('terragrunt \\');
      expect(result).toContain('run-all');
    });

    test('generates multi-line command with flags', () => {
      const provider = createMockProvider({
        command: 'plan',
        noColor: true,
        nonInteractive: true,
      });
      const formatter = new TerragruntStringFormatter(provider);
      const result = formatter.toStringMultiLineCommand();
      expect(result).toContain('\\');
      expect(result).toContain('-no-color');
      expect(result).toContain('--terragrunt-non-interactive');
    });

    test('keeps flag and value together on same line', () => {
      const variables = new Map<string, string>();
      variables.set('env', 'prod');

      const provider = createMockProvider({
        command: 'plan',
        variables,
      });
      const formatter = new TerragruntStringFormatter(provider);
      const result = formatter.toStringMultiLineCommand();
      expect(result).toContain('-var env=prod');
    });

    test('handles last element without backslash', () => {
      const provider = createMockProvider({
        command: 'plan',
        noColor: true,
      });
      const formatter = new TerragruntStringFormatter(provider);
      const result = formatter.toStringMultiLineCommand();
      const lines = result.split('\n');
      const lastLine = lines[lines.length - 1];
      expect(lastLine).not.toMatch(/\\$/);
    });

    test('escapes values with spaces in multi-line format', () => {
      const variables = new Map<string, string>();
      variables.set('message', 'hello world');

      const provider = createMockProvider({
        command: 'plan',
        variables,
      });
      const formatter = new TerragruntStringFormatter(provider);
      const result = formatter.toStringMultiLineCommand();
      expect(result).toContain('"');
    });

    test('handles standalone arguments correctly', () => {
      const provider = createMockProvider({
        command: 'plan',
        outFile: './plan.tfplan',
      });
      const formatter = new TerragruntStringFormatter(provider);
      const result = formatter.toStringMultiLineCommand();
      expect(result).toContain('-out');
      expect(result).toContain('./plan.tfplan');
    });
  });

  describe('toStringList', () => {
    test('returns array of command parts', () => {
      const provider = createMockProvider({ command: 'plan' });
      const formatter = new TerragruntStringFormatter(provider);
      const result = formatter.toStringList();
      expect(Array.isArray(result)).toBe(true);
      expect(result).toEqual(['terragrunt', 'plan']);
    });

    test('includes all command parts with variables', () => {
      const variables = new Map<string, string>();
      variables.set('env', 'prod');

      const provider = createMockProvider({
        command: 'plan',
        variables,
      });
      const formatter = new TerragruntStringFormatter(provider);
      const result = formatter.toStringList();
      expect(result).toContain('terragrunt');
      expect(result).toContain('plan');
      expect(result).toContain('-var');
      expect(result).toContain('env=prod');
    });

    test('includes terragrunt flags in string list', () => {
      const provider = createMockProvider({
        command: 'plan',
        nonInteractive: true,
        noAutoInit: true,
      });
      const formatter = new TerragruntStringFormatter(provider);
      const result = formatter.toStringList();
      expect(result).toContain('--terragrunt-non-interactive');
      expect(result).toContain('--terragrunt-no-auto-init');
    });

    test('includes include-dirs and exclude-dirs', () => {
      const provider = createMockProvider({
        command: 'plan',
        runAll: true,
        includeDirs: ['./module1', './module2'],
        excludeDirs: ['./module3'],
      });
      const formatter = new TerragruntStringFormatter(provider);
      const result = formatter.toStringList();
      expect(result).toContain('--terragrunt-include-dir');
      expect(result).toContain('./module1');
      expect(result).toContain('./module2');
      expect(result).toContain('--terragrunt-exclude-dir');
      expect(result).toContain('./module3');
    });
  });

  describe('integration scenarios', () => {
    test('complex run-all plan command', () => {
      const variables = new Map<string, string>();
      variables.set('environment', 'production');

      const provider = createMockProvider({
        command: 'plan',
        runAll: true,
        variables,
        nonInteractive: true,
        noAutoInit: false,
        terragruntParallelism: 5,
        includeDirs: ['./live/prod'],
        excludeDirs: ['./live/test'],
      });
      const formatter = new TerragruntStringFormatter(provider);

      const stringResult = formatter.toString();
      const listResult = formatter.toStringList();
      const multiLineResult = formatter.toStringMultiLineCommand();

      expect(stringResult).toContain('terragrunt');
      expect(stringResult).toContain('run-all');
      expect(stringResult).toContain('plan');
      expect(listResult).toContain('terragrunt');
      expect(multiLineResult).toContain('terragrunt \\');
    });

    test('complex apply command with IAM role', () => {
      const provider = createMockProvider({
        command: 'apply',
        autoApprove: true,
        iamRole: 'arn:aws:iam::123456789012:role/TerraformRole',
        iamRoleSessionName: 'terragrunt-session',
        nonInteractive: true,
      });
      const formatter = new TerragruntStringFormatter(provider);

      const stringResult = formatter.toString();
      expect(stringResult).toContain('terragrunt apply');
      expect(stringResult).toContain('-auto-approve');
      expect(stringResult).toContain('--terragrunt-iam-role');
      expect(stringResult).toContain('--terragrunt-iam-role-session-name');
    });

    test('init command with source override', () => {
      const sourceMap = new Map<string, string>();
      sourceMap.set('git::https://github.com/org/modules.git', '/local/modules');

      const provider = createMockProvider({
        command: 'init',
        terragruntSource: '/local/terraform-modules',
        sourceMap,
        reconfigure: true,
      });
      const formatter = new TerragruntStringFormatter(provider);

      const stringResult = formatter.toString();
      expect(stringResult).toContain('terragrunt init');
      expect(stringResult).toContain('--terragrunt-source');
      expect(stringResult).toContain('--terragrunt-source-map');
    });

    test('destroy command with dependencies handling', () => {
      const provider = createMockProvider({
        command: 'destroy',
        runAll: true,
        autoApprove: true,
        ignoreDependencyErrors: true,
        ignoreExternalDependencies: true,
        nonInteractive: true,
      });
      const formatter = new TerragruntStringFormatter(provider);

      const stringResult = formatter.toString();
      const listResult = formatter.toStringList();

      expect(stringResult).toContain('terragrunt');
      expect(stringResult).toContain('run-all');
      expect(stringResult).toContain('destroy');
      expect(listResult).toContain('--terragrunt-ignore-dependency-errors');
      expect(listResult).toContain('--terragrunt-ignore-external-dependencies');
    });

    test('command with terragrunt config and working dir', () => {
      const provider = createMockProvider({
        command: 'plan',
        terragruntConfig: './custom-terragrunt.hcl',
        terragruntWorkingDir: './infrastructure',
        downloadDir: '/tmp/terragrunt-cache',
      });
      const formatter = new TerragruntStringFormatter(provider);

      const stringResult = formatter.toString();
      expect(stringResult).toContain('--terragrunt-config');
      expect(stringResult).toContain('./custom-terragrunt.hcl');
      expect(stringResult).toContain('--terragrunt-working-dir');
      expect(stringResult).toContain('./infrastructure');
      expect(stringResult).toContain('--terragrunt-download-dir');
    });

    test('command with strict include', () => {
      const provider = createMockProvider({
        command: 'plan',
        runAll: true,
        strictInclude: true,
        includeDirs: ['./live/prod/app'],
      });
      const formatter = new TerragruntStringFormatter(provider);

      const listResult = formatter.toStringList();
      expect(listResult).toContain('--terragrunt-strict-include');
    });

    test('command with external dependencies handling', () => {
      const provider = createMockProvider({
        command: 'plan',
        runAll: true,
        includeExternalDependencies: true,
      });
      const formatter = new TerragruntStringFormatter(provider);

      const listResult = formatter.toStringList();
      expect(listResult).toContain('--terragrunt-include-external-dependencies');
    });
  });
});
