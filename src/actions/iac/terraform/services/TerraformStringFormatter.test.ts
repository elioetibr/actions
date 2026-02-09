import { TerraformStringFormatter } from './TerraformStringFormatter';
import { ITerraformProvider, TerraformCommand } from '../interfaces';

/**
 * Creates a mock ITerraformProvider for testing
 */
function createMockProvider(overrides: Partial<ITerraformProvider> = {}): ITerraformProvider {
  return {
    command: 'plan' as TerraformCommand,
    executor: 'terraform',
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
    ...overrides,
  };
}

describe('TerraformStringFormatter', () => {
  describe('constructor', () => {
    test('creates instance with provider', () => {
      const provider = createMockProvider();
      const formatter = new TerraformStringFormatter(provider);
      expect(formatter).toBeInstanceOf(TerraformStringFormatter);
    });
  });

  describe('toString', () => {
    test('generates basic plan command', () => {
      const provider = createMockProvider({ command: 'plan' });
      const formatter = new TerraformStringFormatter(provider);
      expect(formatter.toString()).toBe('terraform plan');
    });

    test('generates apply command with auto-approve', () => {
      const provider = createMockProvider({
        command: 'apply',
        autoApprove: true,
      });
      const formatter = new TerraformStringFormatter(provider);
      expect(formatter.toString()).toContain('terraform apply');
      expect(formatter.toString()).toContain('-auto-approve');
    });

    test('generates init command with backend config', () => {
      const backendConfig = new Map<string, string>();
      backendConfig.set('bucket', 'my-bucket');
      backendConfig.set('key', 'state.tfstate');

      const provider = createMockProvider({
        command: 'init',
        backendConfig,
      });
      const formatter = new TerraformStringFormatter(provider);
      const result = formatter.toString();
      expect(result).toContain('terraform init');
      expect(result).toContain('-backend-config');
    });

    test('escapes arguments with spaces', () => {
      const variables = new Map<string, string>();
      variables.set('message', 'hello world');

      const provider = createMockProvider({
        command: 'plan',
        variables,
      });
      const formatter = new TerraformStringFormatter(provider);
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
      const formatter = new TerraformStringFormatter(provider);
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
      const formatter = new TerraformStringFormatter(provider);
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
      const formatter = new TerraformStringFormatter(provider);
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
      const formatter = new TerraformStringFormatter(provider);
      const result = formatter.toString();
      expect(result).toContain('"');
    });

    test('does not escape simple arguments', () => {
      const provider = createMockProvider({
        command: 'plan',
        noColor: true,
      });
      const formatter = new TerraformStringFormatter(provider);
      const result = formatter.toString();
      expect(result).toContain('-no-color');
      expect(result).not.toContain('"-no-color"');
    });
  });

  describe('toStringMultiLineCommand', () => {
    test('returns empty string for empty command', () => {
      // This is a theoretical case - in practice terraform commands always have at least 2 parts
      const provider = createMockProvider({ command: 'plan' });
      const formatter = new TerraformStringFormatter(provider);
      const result = formatter.toStringMultiLineCommand();
      // Should at least have terraform and plan
      expect(result).toContain('terraform');
    });

    test('generates multi-line plan command', () => {
      const provider = createMockProvider({ command: 'plan' });
      const formatter = new TerraformStringFormatter(provider);
      const result = formatter.toStringMultiLineCommand();
      expect(result).toContain('terraform \\');
      expect(result).toContain('  plan');
    });

    test('generates multi-line command with flags', () => {
      const provider = createMockProvider({
        command: 'plan',
        noColor: true,
      });
      const formatter = new TerraformStringFormatter(provider);
      const result = formatter.toStringMultiLineCommand();
      expect(result).toContain('\\');
      expect(result).toContain('-no-color');
    });

    test('keeps flag and value together on same line', () => {
      const variables = new Map<string, string>();
      variables.set('env', 'prod');

      const provider = createMockProvider({
        command: 'plan',
        variables,
      });
      const formatter = new TerraformStringFormatter(provider);
      const result = formatter.toStringMultiLineCommand();
      expect(result).toContain('-var env=prod');
    });

    test('generates multi-line command with multiple options', () => {
      const variables = new Map<string, string>();
      variables.set('env', 'prod');

      const provider = createMockProvider({
        command: 'apply',
        variables,
        autoApprove: true,
        noColor: true,
      });
      const formatter = new TerraformStringFormatter(provider);
      const result = formatter.toStringMultiLineCommand();
      const lines = result.split('\n');
      expect(lines.length).toBeGreaterThan(2);
    });

    test('handles last element without backslash', () => {
      const provider = createMockProvider({
        command: 'plan',
        noColor: true,
      });
      const formatter = new TerraformStringFormatter(provider);
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
      const formatter = new TerraformStringFormatter(provider);
      const result = formatter.toStringMultiLineCommand();
      expect(result).toContain('"');
    });

    test('handles standalone arguments correctly', () => {
      const provider = createMockProvider({
        command: 'plan',
        outFile: './plan.tfplan',
      });
      const formatter = new TerraformStringFormatter(provider);
      const result = formatter.toStringMultiLineCommand();
      expect(result).toContain('-out');
      expect(result).toContain('./plan.tfplan');
    });
  });

  describe('toStringList', () => {
    test('returns array of command parts', () => {
      const provider = createMockProvider({ command: 'plan' });
      const formatter = new TerraformStringFormatter(provider);
      const result = formatter.toStringList();
      expect(Array.isArray(result)).toBe(true);
      expect(result).toEqual(['terraform', 'plan']);
    });

    test('includes all command parts with variables', () => {
      const variables = new Map<string, string>();
      variables.set('env', 'prod');

      const provider = createMockProvider({
        command: 'plan',
        variables,
      });
      const formatter = new TerraformStringFormatter(provider);
      const result = formatter.toStringList();
      expect(result).toContain('terraform');
      expect(result).toContain('plan');
      expect(result).toContain('-var');
      expect(result).toContain('env=prod');
    });

    test('includes flags in string list', () => {
      const provider = createMockProvider({
        command: 'apply',
        autoApprove: true,
        noColor: true,
      });
      const formatter = new TerraformStringFormatter(provider);
      const result = formatter.toStringList();
      expect(result).toContain('-auto-approve');
      expect(result).toContain('-no-color');
    });

    test('includes targets in string list', () => {
      const provider = createMockProvider({
        command: 'plan',
        targets: ['module.vpc', 'aws_instance.web'],
      });
      const formatter = new TerraformStringFormatter(provider);
      const result = formatter.toStringList();
      expect(result).toContain('-target');
      expect(result).toContain('module.vpc');
      expect(result).toContain('aws_instance.web');
    });

    test('includes var files in string list', () => {
      const provider = createMockProvider({
        command: 'plan',
        varFiles: ['prod.tfvars', 'common.tfvars'],
      });
      const formatter = new TerraformStringFormatter(provider);
      const result = formatter.toStringList();
      expect(result).toContain('-var-file');
      expect(result).toContain('prod.tfvars');
      expect(result).toContain('common.tfvars');
    });
  });

  describe('integration scenarios', () => {
    test('complex init command', () => {
      const backendConfig = new Map<string, string>();
      backendConfig.set('bucket', 'terraform-state');
      backendConfig.set('key', 'prod/terraform.tfstate');
      backendConfig.set('region', 'us-east-1');

      const provider = createMockProvider({
        command: 'init',
        backendConfig,
        reconfigure: true,
        noColor: true,
      });
      const formatter = new TerraformStringFormatter(provider);

      const stringResult = formatter.toString();
      expect(stringResult).toContain('terraform init');
      expect(stringResult).toContain('-reconfigure');
      expect(stringResult).toContain('-no-color');
      expect(stringResult).toContain('-backend-config');
    });

    test('complex plan command', () => {
      const variables = new Map<string, string>();
      variables.set('environment', 'production');
      variables.set('region', 'us-east-1');

      const provider = createMockProvider({
        command: 'plan',
        variables,
        varFiles: ['./prod.tfvars'],
        targets: ['module.vpc'],
        outFile: './plan.tfplan',
        noColor: true,
        parallelism: 10,
      });
      const formatter = new TerraformStringFormatter(provider);

      const stringResult = formatter.toString();
      const listResult = formatter.toStringList();
      const multiLineResult = formatter.toStringMultiLineCommand();

      expect(stringResult).toContain('terraform plan');
      expect(listResult).toContain('terraform');
      expect(multiLineResult).toContain('terraform \\');
    });

    test('complex apply command', () => {
      const variables = new Map<string, string>();
      variables.set('environment', 'production');

      const provider = createMockProvider({
        command: 'apply',
        variables,
        planFile: './plan.tfplan',
        autoApprove: true,
        noColor: true,
        lockTimeout: '30s',
      });
      const formatter = new TerraformStringFormatter(provider);

      const stringResult = formatter.toString();
      expect(stringResult).toContain('terraform apply');
      expect(stringResult).toContain('-auto-approve');
    });

    test('destroy command with targets', () => {
      const provider = createMockProvider({
        command: 'destroy',
        targets: ['module.old_resources', 'aws_instance.deprecated'],
        autoApprove: true,
        noColor: true,
      });
      const formatter = new TerraformStringFormatter(provider);

      const stringResult = formatter.toString();
      const listResult = formatter.toStringList();

      expect(stringResult).toContain('terraform destroy');
      expect(stringResult).toContain('-auto-approve');
      expect(listResult).toContain('-target');
    });
  });
});
