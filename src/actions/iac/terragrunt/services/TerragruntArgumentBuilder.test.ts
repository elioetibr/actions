import { TerragruntArgumentBuilder } from './TerragruntArgumentBuilder';
import { ITerragruntProvider, TerragruntCommand } from '../interfaces';

/**
 * Creates a mock ITerragruntProvider for testing.
 * Defaults to v0.x (terragruntMajorVersion: 0) to match legacy behavior.
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
    terragruntMajorVersion: 0,
    ...overrides,
  };
}

describe('TerragruntArgumentBuilder', () => {
  // ================================================================
  // toCommandArgs — terragrunt global flags (v0 vs v1)
  // ================================================================
  describe('toCommandArgs - v0.x flags (legacy)', () => {
    test('returns empty args for default provider', () => {
      const builder = new TerragruntArgumentBuilder(createMockProvider());
      expect(builder.toCommandArgs()).toEqual([]);
    });

    test('adds --terragrunt-config for v0', () => {
      const builder = new TerragruntArgumentBuilder(
        createMockProvider({ terragruntConfig: './custom.hcl' }),
      );
      const args = builder.toCommandArgs();
      expect(args).toContain('--terragrunt-config');
      expect(args).toContain('./custom.hcl');
    });

    test('adds --terragrunt-working-dir for v0', () => {
      const builder = new TerragruntArgumentBuilder(
        createMockProvider({ terragruntWorkingDir: './live/prod' }),
      );
      const args = builder.toCommandArgs();
      expect(args).toContain('--terragrunt-working-dir');
      expect(args).toContain('./live/prod');
    });

    test('adds --terragrunt-no-auto-init for v0', () => {
      const builder = new TerragruntArgumentBuilder(createMockProvider({ noAutoInit: true }));
      expect(builder.toCommandArgs()).toContain('--terragrunt-no-auto-init');
    });

    test('adds --terragrunt-no-auto-retry for v0', () => {
      const builder = new TerragruntArgumentBuilder(createMockProvider({ noAutoRetry: true }));
      expect(builder.toCommandArgs()).toContain('--terragrunt-no-auto-retry');
    });

    test('adds --terragrunt-non-interactive for v0', () => {
      const builder = new TerragruntArgumentBuilder(createMockProvider({ nonInteractive: true }));
      expect(builder.toCommandArgs()).toContain('--terragrunt-non-interactive');
    });

    test('adds --terragrunt-parallelism for v0 with run-all', () => {
      const builder = new TerragruntArgumentBuilder(
        createMockProvider({
          runAll: true,
          terragruntParallelism: 5,
        }),
      );
      const args = builder.toCommandArgs();
      expect(args).toContain('--terragrunt-parallelism');
      expect(args).toContain('5');
    });

    test('does not add parallelism without run-all', () => {
      const builder = new TerragruntArgumentBuilder(
        createMockProvider({ terragruntParallelism: 5 }),
      );
      expect(builder.toCommandArgs()).not.toContain('--terragrunt-parallelism');
    });

    test('adds --terragrunt-include-dir for v0', () => {
      const builder = new TerragruntArgumentBuilder(
        createMockProvider({ includeDirs: ['./module1', './module2'] }),
      );
      const args = builder.toCommandArgs();
      // Two --terragrunt-include-dir flags, one per directory
      const flagIndices = args.reduce<number[]>(
        (acc, arg, i) => (arg === '--terragrunt-include-dir' ? [...acc, i] : acc),
        [],
      );
      expect(flagIndices).toHaveLength(2);
      expect(args[flagIndices[0]! + 1]).toBe('./module1');
      expect(args[flagIndices[1]! + 1]).toBe('./module2');
    });

    test('adds --terragrunt-exclude-dir for v0', () => {
      const builder = new TerragruntArgumentBuilder(
        createMockProvider({ excludeDirs: ['./deprecated'] }),
      );
      const args = builder.toCommandArgs();
      expect(args).toContain('--terragrunt-exclude-dir');
      expect(args).toContain('./deprecated');
    });

    test('adds --terragrunt-ignore-dependency-errors for v0', () => {
      const builder = new TerragruntArgumentBuilder(
        createMockProvider({ ignoreDependencyErrors: true }),
      );
      expect(builder.toCommandArgs()).toContain('--terragrunt-ignore-dependency-errors');
    });

    test('adds --terragrunt-ignore-external-dependencies for v0', () => {
      const builder = new TerragruntArgumentBuilder(
        createMockProvider({ ignoreExternalDependencies: true }),
      );
      expect(builder.toCommandArgs()).toContain('--terragrunt-ignore-external-dependencies');
    });

    test('adds --terragrunt-include-external-dependencies for v0', () => {
      const builder = new TerragruntArgumentBuilder(
        createMockProvider({ includeExternalDependencies: true }),
      );
      expect(builder.toCommandArgs()).toContain('--terragrunt-include-external-dependencies');
    });

    test('adds --terragrunt-source for v0', () => {
      const builder = new TerragruntArgumentBuilder(
        createMockProvider({ terragruntSource: '/local/modules' }),
      );
      const args = builder.toCommandArgs();
      expect(args).toContain('--terragrunt-source');
      expect(args).toContain('/local/modules');
    });

    test('adds --terragrunt-source-map for v0', () => {
      const sourceMap = new Map([['git::https://example.com', '/local']]);
      const builder = new TerragruntArgumentBuilder(createMockProvider({ sourceMap }));
      const args = builder.toCommandArgs();
      expect(args).toContain('--terragrunt-source-map');
      expect(args).toContain('git::https://example.com=/local');
    });

    test('adds --terragrunt-download-dir for v0', () => {
      const builder = new TerragruntArgumentBuilder(
        createMockProvider({ downloadDir: '/tmp/tg-cache' }),
      );
      const args = builder.toCommandArgs();
      expect(args).toContain('--terragrunt-download-dir');
      expect(args).toContain('/tmp/tg-cache');
    });

    test('adds --terragrunt-iam-role for v0', () => {
      const builder = new TerragruntArgumentBuilder(
        createMockProvider({ iamRole: 'arn:aws:iam::123:role/R' }),
      );
      const args = builder.toCommandArgs();
      expect(args).toContain('--terragrunt-iam-role');
      expect(args).toContain('arn:aws:iam::123:role/R');
    });

    test('adds --terragrunt-iam-role-session-name for v0', () => {
      const builder = new TerragruntArgumentBuilder(
        createMockProvider({ iamRoleSessionName: 'my-session' }),
      );
      const args = builder.toCommandArgs();
      expect(args).toContain('--terragrunt-iam-role-session-name');
      expect(args).toContain('my-session');
    });

    test('adds --terragrunt-strict-include for v0', () => {
      const builder = new TerragruntArgumentBuilder(createMockProvider({ strictInclude: true }));
      expect(builder.toCommandArgs()).toContain('--terragrunt-strict-include');
    });
  });

  describe('toCommandArgs - v1.x flags (CLI redesign)', () => {
    test('adds --config for v1', () => {
      const builder = new TerragruntArgumentBuilder(
        createMockProvider({
          terragruntMajorVersion: 1,
          terragruntConfig: './custom.hcl',
        }),
      );
      const args = builder.toCommandArgs();
      expect(args).toContain('--config');
      expect(args).not.toContain('--terragrunt-config');
    });

    test('adds --working-dir for v1', () => {
      const builder = new TerragruntArgumentBuilder(
        createMockProvider({
          terragruntMajorVersion: 1,
          terragruntWorkingDir: './live',
        }),
      );
      const args = builder.toCommandArgs();
      expect(args).toContain('--working-dir');
      expect(args).not.toContain('--terragrunt-working-dir');
    });

    test('adds --no-auto-init for v1', () => {
      const builder = new TerragruntArgumentBuilder(
        createMockProvider({ terragruntMajorVersion: 1, noAutoInit: true }),
      );
      const args = builder.toCommandArgs();
      expect(args).toContain('--no-auto-init');
      expect(args).not.toContain('--terragrunt-no-auto-init');
    });

    test('adds --no-auto-retry for v1', () => {
      const builder = new TerragruntArgumentBuilder(
        createMockProvider({ terragruntMajorVersion: 1, noAutoRetry: true }),
      );
      const args = builder.toCommandArgs();
      expect(args).toContain('--no-auto-retry');
      expect(args).not.toContain('--terragrunt-no-auto-retry');
    });

    test('adds --non-interactive for v1', () => {
      const builder = new TerragruntArgumentBuilder(
        createMockProvider({ terragruntMajorVersion: 1, nonInteractive: true }),
      );
      const args = builder.toCommandArgs();
      expect(args).toContain('--non-interactive');
      expect(args).not.toContain('--terragrunt-non-interactive');
    });

    test('adds --parallelism for v1 with run-all', () => {
      const builder = new TerragruntArgumentBuilder(
        createMockProvider({
          terragruntMajorVersion: 1,
          runAll: true,
          terragruntParallelism: 3,
        }),
      );
      const args = builder.toCommandArgs();
      expect(args).toContain('--parallelism');
      expect(args).toContain('3');
      expect(args).not.toContain('--terragrunt-parallelism');
    });

    test('adds --queue-include-dir for v1', () => {
      const builder = new TerragruntArgumentBuilder(
        createMockProvider({
          terragruntMajorVersion: 1,
          includeDirs: ['./mod'],
        }),
      );
      const args = builder.toCommandArgs();
      expect(args).toContain('--queue-include-dir');
      expect(args).not.toContain('--terragrunt-include-dir');
    });

    test('adds --queue-exclude-dir for v1', () => {
      const builder = new TerragruntArgumentBuilder(
        createMockProvider({
          terragruntMajorVersion: 1,
          excludeDirs: ['./old'],
        }),
      );
      const args = builder.toCommandArgs();
      expect(args).toContain('--queue-exclude-dir');
      expect(args).not.toContain('--terragrunt-exclude-dir');
    });

    test('adds --queue-ignore-errors for v1', () => {
      const builder = new TerragruntArgumentBuilder(
        createMockProvider({
          terragruntMajorVersion: 1,
          ignoreDependencyErrors: true,
        }),
      );
      const args = builder.toCommandArgs();
      expect(args).toContain('--queue-ignore-errors');
      expect(args).not.toContain('--terragrunt-ignore-dependency-errors');
    });

    test('adds --queue-exclude-external for v1', () => {
      const builder = new TerragruntArgumentBuilder(
        createMockProvider({
          terragruntMajorVersion: 1,
          ignoreExternalDependencies: true,
        }),
      );
      const args = builder.toCommandArgs();
      expect(args).toContain('--queue-exclude-external');
      expect(args).not.toContain('--terragrunt-ignore-external-dependencies');
    });

    test('adds --queue-include-external for v1', () => {
      const builder = new TerragruntArgumentBuilder(
        createMockProvider({
          terragruntMajorVersion: 1,
          includeExternalDependencies: true,
        }),
      );
      const args = builder.toCommandArgs();
      expect(args).toContain('--queue-include-external');
      expect(args).not.toContain('--terragrunt-include-external-dependencies');
    });

    test('adds --source for v1', () => {
      const builder = new TerragruntArgumentBuilder(
        createMockProvider({
          terragruntMajorVersion: 1,
          terragruntSource: '/local/src',
        }),
      );
      const args = builder.toCommandArgs();
      expect(args).toContain('--source');
      expect(args).not.toContain('--terragrunt-source');
    });

    test('adds --source-map for v1', () => {
      const sourceMap = new Map([['git::a', '/b']]);
      const builder = new TerragruntArgumentBuilder(
        createMockProvider({ terragruntMajorVersion: 1, sourceMap }),
      );
      const args = builder.toCommandArgs();
      expect(args).toContain('--source-map');
      expect(args).toContain('git::a=/b');
      expect(args).not.toContain('--terragrunt-source-map');
    });

    test('adds --download-dir for v1', () => {
      const builder = new TerragruntArgumentBuilder(
        createMockProvider({
          terragruntMajorVersion: 1,
          downloadDir: '/tmp/dl',
        }),
      );
      const args = builder.toCommandArgs();
      expect(args).toContain('--download-dir');
      expect(args).not.toContain('--terragrunt-download-dir');
    });

    test('adds --iam-role for v1', () => {
      const builder = new TerragruntArgumentBuilder(
        createMockProvider({
          terragruntMajorVersion: 1,
          iamRole: 'arn:aws:iam::123:role/R',
        }),
      );
      const args = builder.toCommandArgs();
      expect(args).toContain('--iam-role');
      expect(args).not.toContain('--terragrunt-iam-role');
    });

    test('adds --iam-role-session-name for v1', () => {
      const builder = new TerragruntArgumentBuilder(
        createMockProvider({
          terragruntMajorVersion: 1,
          iamRoleSessionName: 'sess',
        }),
      );
      const args = builder.toCommandArgs();
      expect(args).toContain('--iam-role-session-name');
      expect(args).not.toContain('--terragrunt-iam-role-session-name');
    });

    test('adds --queue-strict-include for v1', () => {
      const builder = new TerragruntArgumentBuilder(
        createMockProvider({ terragruntMajorVersion: 1, strictInclude: true }),
      );
      const args = builder.toCommandArgs();
      expect(args).toContain('--queue-strict-include');
      expect(args).not.toContain('--terragrunt-strict-include');
    });
  });

  // ================================================================
  // toCommandArgs — terraform arguments
  // ================================================================
  describe('toCommandArgs - terraform arguments', () => {
    test('adds terraform variables for terraform commands', () => {
      const variables = new Map([['env', 'prod']]);
      const builder = new TerragruntArgumentBuilder(
        createMockProvider({ command: 'plan', variables }),
      );
      const args = builder.toCommandArgs();
      expect(args).toContain('-var');
      expect(args).toContain('env=prod');
    });

    test('does not add terraform args for terragrunt-native commands', () => {
      const variables = new Map([['env', 'prod']]);
      const builder = new TerragruntArgumentBuilder(
        createMockProvider({ command: 'hclfmt', variables }),
      );
      const args = builder.toCommandArgs();
      expect(args).not.toContain('-var');
    });

    test('adds -auto-approve for apply command', () => {
      const builder = new TerragruntArgumentBuilder(
        createMockProvider({ command: 'apply', autoApprove: true }),
      );
      expect(builder.toCommandArgs()).toContain('-auto-approve');
    });

    test('adds -no-color for terraform commands', () => {
      const builder = new TerragruntArgumentBuilder(
        createMockProvider({ command: 'plan', noColor: true }),
      );
      expect(builder.toCommandArgs()).toContain('-no-color');
    });

    test('adds -out for plan command', () => {
      const builder = new TerragruntArgumentBuilder(
        createMockProvider({ command: 'plan', outFile: 'plan.tfplan' }),
      );
      const args = builder.toCommandArgs();
      expect(args).toContain('-out');
      expect(args).toContain('plan.tfplan');
    });
  });

  // ================================================================
  // buildCommand — standard commands
  // ================================================================
  describe('buildCommand - standard commands', () => {
    test('builds basic terraform command via terragrunt', () => {
      const builder = new TerragruntArgumentBuilder(createMockProvider({ command: 'plan' }));
      expect(builder.buildCommand()).toEqual(['terragrunt', 'plan']);
    });

    test('builds apply command with arguments', () => {
      const builder = new TerragruntArgumentBuilder(
        createMockProvider({ command: 'apply', autoApprove: true }),
      );
      const cmd = builder.buildCommand();
      expect(cmd[0]).toBe('terragrunt');
      expect(cmd[1]).toBe('apply');
      expect(cmd).toContain('-auto-approve');
    });

    test('builds terragrunt-native command (hclfmt) for v0', () => {
      const builder = new TerragruntArgumentBuilder(createMockProvider({ command: 'hclfmt' }));
      expect(builder.buildCommand()).toEqual(['terragrunt', 'hclfmt']);
    });
  });

  // ================================================================
  // buildCommand — run-all (v0 vs v1)
  // ================================================================
  describe('buildCommand - run-all', () => {
    test('v0.x: terragrunt run-all plan', () => {
      const builder = new TerragruntArgumentBuilder(
        createMockProvider({
          command: 'plan',
          runAll: true,
          terragruntMajorVersion: 0,
        }),
      );
      const cmd = builder.buildCommand();
      expect(cmd[0]).toBe('terragrunt');
      expect(cmd[1]).toBe('run-all');
      expect(cmd[2]).toBe('plan');
    });

    test('v1.x: terragrunt run --all plan', () => {
      const builder = new TerragruntArgumentBuilder(
        createMockProvider({
          command: 'plan',
          runAll: true,
          terragruntMajorVersion: 1,
        }),
      );
      const cmd = builder.buildCommand();
      expect(cmd[0]).toBe('terragrunt');
      expect(cmd[1]).toBe('run');
      expect(cmd[2]).toBe('--all');
      expect(cmd[3]).toBe('plan');
    });

    test('v0.x: run-all apply includes flags and args', () => {
      const builder = new TerragruntArgumentBuilder(
        createMockProvider({
          command: 'apply',
          runAll: true,
          autoApprove: true,
          nonInteractive: true,
          terragruntMajorVersion: 0,
        }),
      );
      const cmd = builder.buildCommand();
      expect(cmd[0]).toBe('terragrunt');
      expect(cmd[1]).toBe('run-all');
      expect(cmd[2]).toBe('apply');
      expect(cmd).toContain('--terragrunt-non-interactive');
      expect(cmd).toContain('-auto-approve');
    });

    test('v1.x: run --all apply includes v1 flags', () => {
      const builder = new TerragruntArgumentBuilder(
        createMockProvider({
          command: 'apply',
          runAll: true,
          autoApprove: true,
          nonInteractive: true,
          terragruntMajorVersion: 1,
        }),
      );
      const cmd = builder.buildCommand();
      expect(cmd[0]).toBe('terragrunt');
      expect(cmd[1]).toBe('run');
      expect(cmd[2]).toBe('--all');
      expect(cmd[3]).toBe('apply');
      expect(cmd).toContain('--non-interactive');
      expect(cmd).not.toContain('--terragrunt-non-interactive');
      expect(cmd).toContain('-auto-approve');
    });

    test('run-all does not apply to non-terraform commands', () => {
      const builder = new TerragruntArgumentBuilder(
        createMockProvider({
          command: 'hclfmt',
          runAll: true,
          terragruntMajorVersion: 0,
        }),
      );
      const cmd = builder.buildCommand();
      // hclfmt is not a terraform command, so run-all is not applied
      expect(cmd).toEqual(['terragrunt', 'hclfmt']);
    });
  });

  // ================================================================
  // buildCommand — renamed commands (v1)
  // ================================================================
  describe('buildCommand - renamed commands in v1', () => {
    test('v1: hclfmt becomes hcl fmt', () => {
      const builder = new TerragruntArgumentBuilder(
        createMockProvider({ command: 'hclfmt', terragruntMajorVersion: 1 }),
      );
      expect(builder.buildCommand()).toEqual(['terragrunt', 'hcl', 'fmt']);
    });

    test('v1: graph-dependencies becomes dag graph', () => {
      const builder = new TerragruntArgumentBuilder(
        createMockProvider({
          command: 'graph-dependencies',
          terragruntMajorVersion: 1,
        }),
      );
      expect(builder.buildCommand()).toEqual(['terragrunt', 'dag', 'graph']);
    });

    test('v1: render-json becomes render --json -w', () => {
      const builder = new TerragruntArgumentBuilder(
        createMockProvider({
          command: 'render-json',
          terragruntMajorVersion: 1,
        }),
      );
      expect(builder.buildCommand()).toEqual(['terragrunt', 'render', '--json', '-w']);
    });

    test('v1: output-module-groups becomes find --dag --json', () => {
      const builder = new TerragruntArgumentBuilder(
        createMockProvider({
          command: 'output-module-groups',
          terragruntMajorVersion: 1,
        }),
      );
      expect(builder.buildCommand()).toEqual(['terragrunt', 'find', '--dag', '--json']);
    });

    test('v1: validate-inputs becomes validate inputs', () => {
      const builder = new TerragruntArgumentBuilder(
        createMockProvider({
          command: 'validate-inputs',
          terragruntMajorVersion: 1,
        }),
      );
      expect(builder.buildCommand()).toEqual(['terragrunt', 'validate', 'inputs']);
    });

    test('v0: renamed commands are unchanged', () => {
      const builder = new TerragruntArgumentBuilder(
        createMockProvider({
          command: 'graph-dependencies',
          terragruntMajorVersion: 0,
        }),
      );
      expect(builder.buildCommand()).toEqual(['terragrunt', 'graph-dependencies']);
    });
  });

  // ================================================================
  // buildCommand — removed commands (v1)
  // ================================================================
  describe('buildCommand - removed commands in v1', () => {
    test('v1: aws-provider-patch throws error', () => {
      const builder = new TerragruntArgumentBuilder(
        createMockProvider({
          command: 'aws-provider-patch',
          terragruntMajorVersion: 1,
        }),
      );
      expect(() => builder.buildCommand()).toThrow(
        "Command 'aws-provider-patch' was removed in Terragrunt v1.x and has no equivalent.",
      );
    });

    test('v0: aws-provider-patch works normally', () => {
      const builder = new TerragruntArgumentBuilder(
        createMockProvider({
          command: 'aws-provider-patch',
          terragruntMajorVersion: 0,
        }),
      );
      expect(builder.buildCommand()).toEqual(['terragrunt', 'aws-provider-patch']);
    });
  });

  // ================================================================
  // Integration: all flags together
  // ================================================================
  describe('integration - full command with all options', () => {
    test('v0: complex run-all plan with all terragrunt flags', () => {
      const sourceMap = new Map([['git::src', '/local']]);
      const builder = new TerragruntArgumentBuilder(
        createMockProvider({
          command: 'plan',
          runAll: true,
          terragruntConfig: './tg.hcl',
          terragruntWorkingDir: './live',
          noAutoInit: true,
          noAutoRetry: true,
          nonInteractive: true,
          terragruntParallelism: 4,
          includeDirs: ['./mod1'],
          excludeDirs: ['./mod2'],
          ignoreDependencyErrors: true,
          ignoreExternalDependencies: true,
          includeExternalDependencies: true,
          terragruntSource: '/src',
          sourceMap,
          downloadDir: '/dl',
          iamRole: 'arn:aws:iam::1:role/R',
          iamRoleSessionName: 'sess',
          strictInclude: true,
          // Terraform args
          noColor: true,
          terragruntMajorVersion: 0,
        }),
      );
      const cmd = builder.buildCommand();
      // run-all structure
      expect(cmd[0]).toBe('terragrunt');
      expect(cmd[1]).toBe('run-all');
      expect(cmd[2]).toBe('plan');
      // v0 flags
      expect(cmd).toContain('--terragrunt-config');
      expect(cmd).toContain('--terragrunt-working-dir');
      expect(cmd).toContain('--terragrunt-no-auto-init');
      expect(cmd).toContain('--terragrunt-no-auto-retry');
      expect(cmd).toContain('--terragrunt-non-interactive');
      expect(cmd).toContain('--terragrunt-parallelism');
      expect(cmd).toContain('--terragrunt-include-dir');
      expect(cmd).toContain('--terragrunt-exclude-dir');
      expect(cmd).toContain('--terragrunt-ignore-dependency-errors');
      expect(cmd).toContain('--terragrunt-ignore-external-dependencies');
      expect(cmd).toContain('--terragrunt-include-external-dependencies');
      expect(cmd).toContain('--terragrunt-source');
      expect(cmd).toContain('--terragrunt-source-map');
      expect(cmd).toContain('--terragrunt-download-dir');
      expect(cmd).toContain('--terragrunt-iam-role');
      expect(cmd).toContain('--terragrunt-iam-role-session-name');
      expect(cmd).toContain('--terragrunt-strict-include');
      // Terraform args
      expect(cmd).toContain('-no-color');
    });

    test('v1: complex run --all plan with all v1 flags', () => {
      const sourceMap = new Map([['git::src', '/local']]);
      const builder = new TerragruntArgumentBuilder(
        createMockProvider({
          command: 'plan',
          runAll: true,
          terragruntConfig: './tg.hcl',
          terragruntWorkingDir: './live',
          noAutoInit: true,
          noAutoRetry: true,
          nonInteractive: true,
          terragruntParallelism: 4,
          includeDirs: ['./mod1'],
          excludeDirs: ['./mod2'],
          ignoreDependencyErrors: true,
          ignoreExternalDependencies: true,
          includeExternalDependencies: true,
          terragruntSource: '/src',
          sourceMap,
          downloadDir: '/dl',
          iamRole: 'arn:aws:iam::1:role/R',
          iamRoleSessionName: 'sess',
          strictInclude: true,
          noColor: true,
          terragruntMajorVersion: 1,
        }),
      );
      const cmd = builder.buildCommand();
      // v1 run --all structure
      expect(cmd[0]).toBe('terragrunt');
      expect(cmd[1]).toBe('run');
      expect(cmd[2]).toBe('--all');
      expect(cmd[3]).toBe('plan');
      // v1 flags — none should have --terragrunt- prefix
      expect(cmd).toContain('--config');
      expect(cmd).toContain('--working-dir');
      expect(cmd).toContain('--no-auto-init');
      expect(cmd).toContain('--no-auto-retry');
      expect(cmd).toContain('--non-interactive');
      expect(cmd).toContain('--parallelism');
      expect(cmd).toContain('--queue-include-dir');
      expect(cmd).toContain('--queue-exclude-dir');
      expect(cmd).toContain('--queue-ignore-errors');
      expect(cmd).toContain('--queue-exclude-external');
      expect(cmd).toContain('--queue-include-external');
      expect(cmd).toContain('--source');
      expect(cmd).toContain('--source-map');
      expect(cmd).toContain('--download-dir');
      expect(cmd).toContain('--iam-role');
      expect(cmd).toContain('--iam-role-session-name');
      expect(cmd).toContain('--queue-strict-include');
      // Terraform args (unchanged between versions)
      expect(cmd).toContain('-no-color');
      // Verify NO v0 flags leaked through
      const v0Flags = cmd.filter(arg => arg.startsWith('--terragrunt-'));
      expect(v0Flags).toEqual([]);
    });
  });
});
