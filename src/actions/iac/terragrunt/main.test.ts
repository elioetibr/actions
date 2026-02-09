import * as core from '@actions/core';
import * as exec from '@actions/exec';
import { run } from './main';
import { TerragruntBuilder } from './TerragruntBuilder';

// Mock @actions/core
jest.mock('@actions/core', () => ({
  getInput: jest.fn(),
  getBooleanInput: jest.fn(),
  setOutput: jest.fn(),
  setFailed: jest.fn(),
  info: jest.fn(),
  warning: jest.fn(),
  debug: jest.fn(),
  error: jest.fn(),
}));

// Mock @actions/exec
jest.mock('@actions/exec', () => ({
  exec: jest.fn(),
}));

describe('terragrunt main', () => {
  const mockGetInput = core.getInput as jest.MockedFunction<typeof core.getInput>;
  const mockGetBooleanInput = core.getBooleanInput as jest.MockedFunction<
    typeof core.getBooleanInput
  >;
  const mockSetOutput = core.setOutput as jest.MockedFunction<typeof core.setOutput>;
  const mockSetFailed = core.setFailed as jest.MockedFunction<typeof core.setFailed>;
  const mockInfo = core.info as jest.MockedFunction<typeof core.info>;
  const mockWarning = core.warning as jest.MockedFunction<typeof core.warning>;
  const mockExec = exec.exec as jest.MockedFunction<typeof exec.exec>;

  beforeEach(() => {
    jest.clearAllMocks();

    // Default input values
    mockGetInput.mockImplementation((name: string) => {
      const inputs: Record<string, string> = {
        command: 'plan',
        'working-directory': '.',
        variables: '{}',
        'var-files': '',
        'backend-config': '{}',
        targets: '',
        'plan-file': '',
        parallelism: '',
        'lock-timeout': '',
        refresh: 'true',
        'terragrunt-config': '',
        'terragrunt-working-dir': '',
        'terragrunt-parallelism': '',
        'include-dirs': '',
        'exclude-dirs': '',
        'terragrunt-source': '',
        'source-map': '{}',
        'download-dir': '',
        'iam-role': '',
        'iam-role-session-name': '',
      };
      return inputs[name] || '';
    });

    mockGetBooleanInput.mockImplementation((name: string) => {
      const inputs: Record<string, boolean> = {
        'run-all': false,
        'auto-approve': false,
        'no-color': false,
        'compact-warnings': false,
        reconfigure: false,
        'migrate-state': false,
        'dry-run': false,
        'non-interactive': false,
        'no-auto-init': false,
        'no-auto-retry': false,
        'ignore-dependency-errors': false,
        'ignore-external-dependencies': false,
        'include-external-dependencies': false,
        'strict-include': false,
      };
      return inputs[name] || false;
    });
  });

  describe('run', () => {
    test('executes plan command successfully', async () => {
      mockExec.mockResolvedValue(0);

      await run();

      expect(mockInfo).toHaveBeenCalledWith('Starting Terragrunt plan action...');
      expect(mockExec).toHaveBeenCalledWith(
        'terragrunt',
        ['plan'],
        expect.objectContaining({
          cwd: '.',
          ignoreReturnCode: true,
        }),
      );
      expect(mockSetOutput).toHaveBeenCalledWith('command', 'plan');
      expect(mockSetOutput).toHaveBeenCalledWith('exit-code', '0');
    });

    test('executes run-all plan command', async () => {
      mockGetBooleanInput.mockImplementation((name: string) => {
        if (name === 'run-all') return true;
        return false;
      });
      mockExec.mockResolvedValue(0);

      await run();

      expect(mockInfo).toHaveBeenCalledWith('Starting Terragrunt run-all plan action...');
      expect(mockExec).toHaveBeenCalledWith(
        'terragrunt',
        expect.arrayContaining(['run-all', 'plan']),
        expect.any(Object),
      );
    });

    test('executes apply command with auto-approve', async () => {
      mockGetInput.mockImplementation((name: string) => {
        if (name === 'command') return 'apply';
        if (name === 'working-directory') return './infrastructure';
        return '';
      });
      mockGetBooleanInput.mockImplementation((name: string) => {
        if (name === 'auto-approve') return true;
        return false;
      });
      mockExec.mockResolvedValue(0);

      await run();

      expect(mockInfo).toHaveBeenCalledWith('Starting Terragrunt apply action...');
      expect(mockExec).toHaveBeenCalledWith(
        'terragrunt',
        expect.arrayContaining(['apply', '-auto-approve']),
        expect.objectContaining({
          cwd: './infrastructure',
        }),
      );
    });

    test('handles dry-run mode', async () => {
      mockGetBooleanInput.mockImplementation((name: string) => {
        if (name === 'dry-run') return true;
        return false;
      });

      await run();

      expect(mockInfo).toHaveBeenCalledWith('Dry run mode - skipping execution');
      expect(mockExec).not.toHaveBeenCalled();
      expect(mockSetOutput).toHaveBeenCalledWith('exit-code', '0');
      expect(mockSetOutput).toHaveBeenCalledWith('stdout', '');
      expect(mockSetOutput).toHaveBeenCalledWith('stderr', '');
    });

    test('handles command failure', async () => {
      mockExec.mockResolvedValue(1);

      await run();

      expect(mockSetFailed).toHaveBeenCalledWith('Terragrunt plan failed with exit code 1');
    });

    test('handles run-all command failure', async () => {
      mockGetBooleanInput.mockImplementation((name: string) => {
        if (name === 'run-all') return true;
        return false;
      });
      mockExec.mockResolvedValue(1);

      await run();

      expect(mockSetFailed).toHaveBeenCalledWith('Terragrunt run-all plan failed with exit code 1');
    });

    test('parses variables JSON', async () => {
      mockGetInput.mockImplementation((name: string) => {
        if (name === 'command') return 'plan';
        if (name === 'variables') return '{"environment": "prod", "region": "us-east-1"}';
        return '';
      });
      mockExec.mockResolvedValue(0);

      await run();

      expect(mockExec).toHaveBeenCalledWith(
        'terragrunt',
        expect.arrayContaining(['-var', 'environment=prod', '-var', 'region=us-east-1']),
        expect.any(Object),
      );
    });

    test('handles invalid JSON variables with warning', async () => {
      mockGetInput.mockImplementation((name: string) => {
        if (name === 'command') return 'plan';
        if (name === 'variables') return 'invalid json';
        return '';
      });
      mockExec.mockResolvedValue(0);

      await run();

      expect(mockWarning).toHaveBeenCalledWith('Failed to parse JSON: invalid json');
    });

    test('parses comma-separated var-files', async () => {
      mockGetInput.mockImplementation((name: string) => {
        if (name === 'command') return 'plan';
        if (name === 'var-files') return 'prod.tfvars, common.tfvars';
        return '';
      });
      mockExec.mockResolvedValue(0);

      await run();

      expect(mockExec).toHaveBeenCalledWith(
        'terragrunt',
        expect.arrayContaining(['-var-file', 'prod.tfvars', '-var-file', 'common.tfvars']),
        expect.any(Object),
      );
    });

    test('parses comma-separated targets', async () => {
      mockGetInput.mockImplementation((name: string) => {
        if (name === 'command') return 'plan';
        if (name === 'targets') return 'module.vpc, aws_instance.web';
        return '';
      });
      mockExec.mockResolvedValue(0);

      await run();

      expect(mockExec).toHaveBeenCalledWith(
        'terragrunt',
        expect.arrayContaining(['-target', 'module.vpc', '-target', 'aws_instance.web']),
        expect.any(Object),
      );
    });

    test('parses backend-config JSON', async () => {
      mockGetInput.mockImplementation((name: string) => {
        if (name === 'command') return 'init';
        if (name === 'backend-config') return '{"bucket": "my-bucket", "key": "state.tfstate"}';
        return '';
      });
      mockExec.mockResolvedValue(0);

      await run();

      expect(mockExec).toHaveBeenCalledWith(
        'terragrunt',
        expect.arrayContaining([
          '-backend-config',
          'bucket=my-bucket',
          '-backend-config',
          'key=state.tfstate',
        ]),
        expect.any(Object),
      );
    });

    test('handles plan-file for apply command', async () => {
      mockGetInput.mockImplementation((name: string) => {
        if (name === 'command') return 'apply';
        if (name === 'plan-file') return './plan.tfplan';
        return '';
      });
      mockGetBooleanInput.mockImplementation((name: string) => {
        if (name === 'auto-approve') return true;
        return false;
      });
      mockExec.mockResolvedValue(0);

      await run();

      expect(mockExec).toHaveBeenCalledWith(
        'terragrunt',
        expect.arrayContaining(['./plan.tfplan']),
        expect.any(Object),
      );
    });

    test('handles plan-file for plan command (as out-file)', async () => {
      mockGetInput.mockImplementation((name: string) => {
        if (name === 'command') return 'plan';
        if (name === 'plan-file') return './plan.tfplan';
        return '';
      });
      mockExec.mockResolvedValue(0);

      await run();

      expect(mockExec).toHaveBeenCalledWith(
        'terragrunt',
        expect.arrayContaining(['-out', './plan.tfplan']),
        expect.any(Object),
      );
    });

    test('handles no-color flag', async () => {
      mockGetBooleanInput.mockImplementation((name: string) => {
        if (name === 'no-color') return true;
        return false;
      });
      mockExec.mockResolvedValue(0);

      await run();

      expect(mockExec).toHaveBeenCalledWith(
        'terragrunt',
        expect.arrayContaining(['-no-color']),
        expect.any(Object),
      );
    });

    test('handles compact-warnings flag', async () => {
      mockGetBooleanInput.mockImplementation((name: string) => {
        if (name === 'compact-warnings') return true;
        return false;
      });
      mockExec.mockResolvedValue(0);

      await run();

      expect(mockExec).toHaveBeenCalledWith(
        'terragrunt',
        expect.arrayContaining(['-compact-warnings']),
        expect.any(Object),
      );
    });

    test('handles parallelism option', async () => {
      mockGetInput.mockImplementation((name: string) => {
        if (name === 'command') return 'plan';
        if (name === 'parallelism') return '10';
        return '';
      });
      mockExec.mockResolvedValue(0);

      await run();

      expect(mockExec).toHaveBeenCalledWith(
        'terragrunt',
        expect.arrayContaining(['-parallelism', '10']),
        expect.any(Object),
      );
    });

    test('handles lock-timeout option', async () => {
      mockGetInput.mockImplementation((name: string) => {
        if (name === 'command') return 'plan';
        if (name === 'lock-timeout') return '30s';
        return '';
      });
      mockExec.mockResolvedValue(0);

      await run();

      expect(mockExec).toHaveBeenCalledWith(
        'terragrunt',
        expect.arrayContaining(['-lock-timeout', '30s']),
        expect.any(Object),
      );
    });

    test('handles refresh=false option', async () => {
      mockGetInput.mockImplementation((name: string) => {
        if (name === 'command') return 'plan';
        if (name === 'refresh') return 'false';
        return '';
      });
      mockExec.mockResolvedValue(0);

      await run();

      expect(mockExec).toHaveBeenCalledWith(
        'terragrunt',
        expect.arrayContaining(['-refresh=false']),
        expect.any(Object),
      );
    });

    test('handles reconfigure flag', async () => {
      mockGetInput.mockImplementation((name: string) => {
        if (name === 'command') return 'init';
        return '';
      });
      mockGetBooleanInput.mockImplementation((name: string) => {
        if (name === 'reconfigure') return true;
        return false;
      });
      mockExec.mockResolvedValue(0);

      await run();

      expect(mockExec).toHaveBeenCalledWith(
        'terragrunt',
        expect.arrayContaining(['-reconfigure']),
        expect.any(Object),
      );
    });

    test('handles migrate-state flag', async () => {
      mockGetInput.mockImplementation((name: string) => {
        if (name === 'command') return 'init';
        return '';
      });
      mockGetBooleanInput.mockImplementation((name: string) => {
        if (name === 'migrate-state') return true;
        return false;
      });
      mockExec.mockResolvedValue(0);

      await run();

      expect(mockExec).toHaveBeenCalledWith(
        'terragrunt',
        expect.arrayContaining(['-migrate-state']),
        expect.any(Object),
      );
    });

    // Terragrunt-specific options

    test('handles terragrunt-config option', async () => {
      mockGetInput.mockImplementation((name: string) => {
        if (name === 'command') return 'plan';
        if (name === 'terragrunt-config') return './custom.hcl';
        return '';
      });
      mockExec.mockResolvedValue(0);

      await run();

      expect(mockExec).toHaveBeenCalledWith(
        'terragrunt',
        expect.arrayContaining(['--terragrunt-config', './custom.hcl']),
        expect.any(Object),
      );
    });

    test('handles terragrunt-working-dir option', async () => {
      mockGetInput.mockImplementation((name: string) => {
        if (name === 'command') return 'plan';
        if (name === 'terragrunt-working-dir') return './live/prod';
        return '';
      });
      mockExec.mockResolvedValue(0);

      await run();

      expect(mockExec).toHaveBeenCalledWith(
        'terragrunt',
        expect.arrayContaining(['--terragrunt-working-dir', './live/prod']),
        expect.any(Object),
      );
    });

    test('handles non-interactive flag', async () => {
      mockGetBooleanInput.mockImplementation((name: string) => {
        if (name === 'non-interactive') return true;
        return false;
      });
      mockExec.mockResolvedValue(0);

      await run();

      expect(mockExec).toHaveBeenCalledWith(
        'terragrunt',
        expect.arrayContaining(['--terragrunt-non-interactive']),
        expect.any(Object),
      );
    });

    test('handles no-auto-init flag', async () => {
      mockGetBooleanInput.mockImplementation((name: string) => {
        if (name === 'no-auto-init') return true;
        return false;
      });
      mockExec.mockResolvedValue(0);

      await run();

      expect(mockExec).toHaveBeenCalledWith(
        'terragrunt',
        expect.arrayContaining(['--terragrunt-no-auto-init']),
        expect.any(Object),
      );
    });

    test('handles no-auto-retry flag', async () => {
      mockGetBooleanInput.mockImplementation((name: string) => {
        if (name === 'no-auto-retry') return true;
        return false;
      });
      mockExec.mockResolvedValue(0);

      await run();

      expect(mockExec).toHaveBeenCalledWith(
        'terragrunt',
        expect.arrayContaining(['--terragrunt-no-auto-retry']),
        expect.any(Object),
      );
    });

    test('handles terragrunt-parallelism option', async () => {
      mockGetInput.mockImplementation((name: string) => {
        if (name === 'command') return 'plan';
        if (name === 'terragrunt-parallelism') return '5';
        return '';
      });
      mockGetBooleanInput.mockImplementation((name: string) => {
        if (name === 'run-all') return true;
        return false;
      });
      mockExec.mockResolvedValue(0);

      await run();

      expect(mockExec).toHaveBeenCalledWith(
        'terragrunt',
        expect.arrayContaining(['--terragrunt-parallelism', '5']),
        expect.any(Object),
      );
    });

    test('handles include-dirs option', async () => {
      mockGetInput.mockImplementation((name: string) => {
        if (name === 'command') return 'plan';
        if (name === 'include-dirs') return './live/prod, ./live/staging';
        return '';
      });
      mockExec.mockResolvedValue(0);

      await run();

      expect(mockExec).toHaveBeenCalledWith(
        'terragrunt',
        expect.arrayContaining([
          '--terragrunt-include-dir',
          './live/prod',
          '--terragrunt-include-dir',
          './live/staging',
        ]),
        expect.any(Object),
      );
    });

    test('handles exclude-dirs option', async () => {
      mockGetInput.mockImplementation((name: string) => {
        if (name === 'command') return 'plan';
        if (name === 'exclude-dirs') return './live/test, ./live/dev';
        return '';
      });
      mockExec.mockResolvedValue(0);

      await run();

      expect(mockExec).toHaveBeenCalledWith(
        'terragrunt',
        expect.arrayContaining([
          '--terragrunt-exclude-dir',
          './live/test',
          '--terragrunt-exclude-dir',
          './live/dev',
        ]),
        expect.any(Object),
      );
    });

    test('handles ignore-dependency-errors flag', async () => {
      mockGetBooleanInput.mockImplementation((name: string) => {
        if (name === 'ignore-dependency-errors') return true;
        return false;
      });
      mockExec.mockResolvedValue(0);

      await run();

      expect(mockExec).toHaveBeenCalledWith(
        'terragrunt',
        expect.arrayContaining(['--terragrunt-ignore-dependency-errors']),
        expect.any(Object),
      );
    });

    test('handles ignore-external-dependencies flag', async () => {
      mockGetBooleanInput.mockImplementation((name: string) => {
        if (name === 'ignore-external-dependencies') return true;
        return false;
      });
      mockExec.mockResolvedValue(0);

      await run();

      expect(mockExec).toHaveBeenCalledWith(
        'terragrunt',
        expect.arrayContaining(['--terragrunt-ignore-external-dependencies']),
        expect.any(Object),
      );
    });

    test('handles include-external-dependencies flag', async () => {
      mockGetBooleanInput.mockImplementation((name: string) => {
        if (name === 'include-external-dependencies') return true;
        return false;
      });
      mockExec.mockResolvedValue(0);

      await run();

      expect(mockExec).toHaveBeenCalledWith(
        'terragrunt',
        expect.arrayContaining(['--terragrunt-include-external-dependencies']),
        expect.any(Object),
      );
    });

    test('handles terragrunt-source option', async () => {
      mockGetInput.mockImplementation((name: string) => {
        if (name === 'command') return 'plan';
        if (name === 'terragrunt-source') return '/local/modules';
        return '';
      });
      mockExec.mockResolvedValue(0);

      await run();

      expect(mockExec).toHaveBeenCalledWith(
        'terragrunt',
        expect.arrayContaining(['--terragrunt-source', '/local/modules']),
        expect.any(Object),
      );
    });

    test('handles source-map option', async () => {
      mockGetInput.mockImplementation((name: string) => {
        if (name === 'command') return 'plan';
        if (name === 'source-map')
          return '{"git::https://github.com/org/modules.git": "/local/modules"}';
        return '';
      });
      mockExec.mockResolvedValue(0);

      await run();

      expect(mockExec).toHaveBeenCalledWith(
        'terragrunt',
        expect.arrayContaining([
          '--terragrunt-source-map',
          'git::https://github.com/org/modules.git=/local/modules',
        ]),
        expect.any(Object),
      );
    });

    test('handles download-dir option', async () => {
      mockGetInput.mockImplementation((name: string) => {
        if (name === 'command') return 'plan';
        if (name === 'download-dir') return '/tmp/terragrunt';
        return '';
      });
      mockExec.mockResolvedValue(0);

      await run();

      expect(mockExec).toHaveBeenCalledWith(
        'terragrunt',
        expect.arrayContaining(['--terragrunt-download-dir', '/tmp/terragrunt']),
        expect.any(Object),
      );
    });

    test('handles iam-role option', async () => {
      mockGetInput.mockImplementation((name: string) => {
        if (name === 'command') return 'plan';
        if (name === 'iam-role') return 'arn:aws:iam::123456789012:role/TerraformRole';
        return '';
      });
      mockExec.mockResolvedValue(0);

      await run();

      expect(mockExec).toHaveBeenCalledWith(
        'terragrunt',
        expect.arrayContaining([
          '--terragrunt-iam-role',
          'arn:aws:iam::123456789012:role/TerraformRole',
        ]),
        expect.any(Object),
      );
    });

    test('handles iam-role with session-name option', async () => {
      mockGetInput.mockImplementation((name: string) => {
        if (name === 'command') return 'plan';
        if (name === 'iam-role') return 'arn:aws:iam::123456789012:role/TerraformRole';
        if (name === 'iam-role-session-name') return 'terragrunt-session';
        return '';
      });
      mockExec.mockResolvedValue(0);

      await run();

      expect(mockExec).toHaveBeenCalledWith(
        'terragrunt',
        expect.arrayContaining([
          '--terragrunt-iam-role',
          'arn:aws:iam::123456789012:role/TerraformRole',
          '--terragrunt-iam-role-session-name',
          'terragrunt-session',
        ]),
        expect.any(Object),
      );
    });

    test('handles strict-include flag', async () => {
      mockGetBooleanInput.mockImplementation((name: string) => {
        if (name === 'strict-include') return true;
        return false;
      });
      mockExec.mockResolvedValue(0);

      await run();

      expect(mockExec).toHaveBeenCalledWith(
        'terragrunt',
        expect.arrayContaining(['--terragrunt-strict-include']),
        expect.any(Object),
      );
    });

    test('captures stdout and stderr', async () => {
      mockExec.mockImplementation(async (_cmd, _args, options) => {
        if (options?.listeners?.stdout) {
          options.listeners.stdout(Buffer.from('Success output'));
        }
        if (options?.listeners?.stderr) {
          options.listeners.stderr(Buffer.from('Warning message'));
        }
        return 0;
      });

      await run();

      expect(mockSetOutput).toHaveBeenCalledWith('stdout', 'Success output');
      expect(mockSetOutput).toHaveBeenCalledWith('stderr', 'Warning message');
    });

    test('sets command-args output', async () => {
      mockExec.mockResolvedValue(0);

      await run();

      expect(mockSetOutput).toHaveBeenCalledWith(
        'command-args',
        expect.stringContaining('terragrunt'),
      );
    });

    test('sets command-string output', async () => {
      mockExec.mockResolvedValue(0);

      await run();

      expect(mockSetOutput).toHaveBeenCalledWith(
        'command-string',
        expect.stringContaining('terragrunt plan'),
      );
    });

    test('handles error during execution', async () => {
      const error = new Error('Execution failed');
      mockExec.mockRejectedValue(error);

      await run();

      expect(mockSetFailed).toHaveBeenCalled();
    });
  });

  describe('empty command guard', () => {
    test('sets failed when buildCommand returns empty array', async () => {
      const mockService = {
        buildCommand: jest.fn().mockReturnValue([]),
        toString: jest.fn().mockReturnValue(''),
      };
      const mockBuilder = {
        withWorkingDirectory: jest.fn().mockReturnThis(),
        withRunAll: jest.fn().mockReturnThis(),
        withVariables: jest.fn().mockReturnThis(),
        withVarFiles: jest.fn().mockReturnThis(),
        withBackendConfigs: jest.fn().mockReturnThis(),
        withTargets: jest.fn().mockReturnThis(),
        withAutoApprove: jest.fn().mockReturnThis(),
        withPlanFile: jest.fn().mockReturnThis(),
        withOutFile: jest.fn().mockReturnThis(),
        withNoColor: jest.fn().mockReturnThis(),
        withCompactWarnings: jest.fn().mockReturnThis(),
        withParallelism: jest.fn().mockReturnThis(),
        withLockTimeout: jest.fn().mockReturnThis(),
        withoutRefresh: jest.fn().mockReturnThis(),
        withReconfigure: jest.fn().mockReturnThis(),
        withMigrateState: jest.fn().mockReturnThis(),
        withTerragruntConfig: jest.fn().mockReturnThis(),
        withTerragruntWorkingDir: jest.fn().mockReturnThis(),
        withNonInteractive: jest.fn().mockReturnThis(),
        withNoAutoInit: jest.fn().mockReturnThis(),
        withNoAutoRetry: jest.fn().mockReturnThis(),
        withTerragruntParallelism: jest.fn().mockReturnThis(),
        withIncludeDirs: jest.fn().mockReturnThis(),
        withExcludeDirs: jest.fn().mockReturnThis(),
        withIgnoreDependencyErrors: jest.fn().mockReturnThis(),
        withIgnoreExternalDependencies: jest.fn().mockReturnThis(),
        withIncludeExternalDependencies: jest.fn().mockReturnThis(),
        withTerragruntSource: jest.fn().mockReturnThis(),
        withSourceMaps: jest.fn().mockReturnThis(),
        withDownloadDir: jest.fn().mockReturnThis(),
        withIamRole: jest.fn().mockReturnThis(),
        withIamRoleAndSession: jest.fn().mockReturnThis(),
        withStrictInclude: jest.fn().mockReturnThis(),
        withDryRun: jest.fn().mockReturnThis(),
        build: jest.fn().mockReturnValue(mockService),
      };
      jest.spyOn(TerragruntBuilder, 'create').mockReturnValue(mockBuilder as any);

      await run();

      expect(mockSetFailed).toHaveBeenCalledWith('Terragrunt produced an empty command');
      jest.restoreAllMocks();
    });
  });
});
