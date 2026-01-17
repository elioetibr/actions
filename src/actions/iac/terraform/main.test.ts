import * as core from '@actions/core';
import * as exec from '@actions/exec';
import { run } from './main';

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

describe('terraform main', () => {
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
      };
      return inputs[name] || '';
    });

    mockGetBooleanInput.mockImplementation((name: string) => {
      const inputs: Record<string, boolean> = {
        'auto-approve': false,
        'no-color': false,
        'compact-warnings': false,
        reconfigure: false,
        'migrate-state': false,
        'dry-run': false,
      };
      return inputs[name] || false;
    });
  });

  describe('run', () => {
    test('executes plan command successfully', async () => {
      mockExec.mockResolvedValue(0);

      await run();

      expect(mockInfo).toHaveBeenCalledWith('Starting Terraform plan action...');
      expect(mockExec).toHaveBeenCalledWith(
        'terraform',
        ['plan'],
        expect.objectContaining({
          cwd: '.',
          ignoreReturnCode: true,
        })
      );
      expect(mockSetOutput).toHaveBeenCalledWith('command', 'plan');
      expect(mockSetOutput).toHaveBeenCalledWith('exit-code', '0');
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

      expect(mockInfo).toHaveBeenCalledWith('Starting Terraform apply action...');
      expect(mockExec).toHaveBeenCalledWith(
        'terraform',
        expect.arrayContaining(['apply', '-auto-approve']),
        expect.objectContaining({
          cwd: './infrastructure',
        })
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

      expect(mockSetFailed).toHaveBeenCalledWith('Terraform plan failed with exit code 1');
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
        'terraform',
        expect.arrayContaining(['-var', 'environment=prod', '-var', 'region=us-east-1']),
        expect.any(Object)
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
        'terraform',
        expect.arrayContaining(['-var-file', 'prod.tfvars', '-var-file', 'common.tfvars']),
        expect.any(Object)
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
        'terraform',
        expect.arrayContaining(['-target', 'module.vpc', '-target', 'aws_instance.web']),
        expect.any(Object)
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
        'terraform',
        expect.arrayContaining([
          '-backend-config',
          'bucket=my-bucket',
          '-backend-config',
          'key=state.tfstate',
        ]),
        expect.any(Object)
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
        'terraform',
        expect.arrayContaining(['./plan.tfplan']),
        expect.any(Object)
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
        'terraform',
        expect.arrayContaining(['-out', './plan.tfplan']),
        expect.any(Object)
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
        'terraform',
        expect.arrayContaining(['-no-color']),
        expect.any(Object)
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
        'terraform',
        expect.arrayContaining(['-compact-warnings']),
        expect.any(Object)
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
        'terraform',
        expect.arrayContaining(['-parallelism', '10']),
        expect.any(Object)
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
        'terraform',
        expect.arrayContaining(['-lock-timeout', '30s']),
        expect.any(Object)
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
        'terraform',
        expect.arrayContaining(['-refresh=false']),
        expect.any(Object)
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
        'terraform',
        expect.arrayContaining(['-reconfigure']),
        expect.any(Object)
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
        'terraform',
        expect.arrayContaining(['-migrate-state']),
        expect.any(Object)
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
        expect.stringContaining('terraform')
      );
    });

    test('sets command-string output', async () => {
      mockExec.mockResolvedValue(0);

      await run();

      expect(mockSetOutput).toHaveBeenCalledWith(
        'command-string',
        expect.stringContaining('terraform plan')
      );
    });

    test('handles error during execution', async () => {
      const error = new Error('Execution failed');
      mockExec.mockRejectedValue(error);

      await run();

      expect(mockSetFailed).toHaveBeenCalled();
    });

    test('handles empty comma-separated input', async () => {
      mockGetInput.mockImplementation((name: string) => {
        if (name === 'command') return 'plan';
        if (name === 'targets') return '';
        return '';
      });
      mockExec.mockResolvedValue(0);

      await run();

      // Should not include -target flags
      const execCall = mockExec.mock.calls[0];
      const args = execCall?.[1] as string[];
      expect(args).not.toContain('-target');
    });

    test('handles whitespace-only input', async () => {
      mockGetInput.mockImplementation((name: string) => {
        if (name === 'command') return 'plan';
        if (name === 'targets') return '   ';
        return '';
      });
      mockExec.mockResolvedValue(0);

      await run();

      // Should not include -target flags
      const execCall = mockExec.mock.calls[0];
      const args = execCall?.[1] as string[];
      expect(args).not.toContain('-target');
    });

    test('handles empty JSON object input', async () => {
      mockGetInput.mockImplementation((name: string) => {
        if (name === 'command') return 'plan';
        if (name === 'variables') return '{}';
        return '';
      });
      mockExec.mockResolvedValue(0);

      await run();

      // Should not include -var flags
      const execCall = mockExec.mock.calls[0];
      const args = execCall?.[1] as string[];
      expect(args).not.toContain('-var');
    });

    test('filters empty strings from comma-separated values', async () => {
      mockGetInput.mockImplementation((name: string) => {
        if (name === 'command') return 'plan';
        if (name === 'targets') return 'module.vpc,,aws_instance.web,';
        return '';
      });
      mockExec.mockResolvedValue(0);

      await run();

      const execCall = mockExec.mock.calls[0];
      const args = execCall?.[1] as string[];
      const targetIndices = args
        .map((arg, i) => (arg === '-target' ? i : -1))
        .filter((i) => i !== -1);
      // Should only have 2 targets
      expect(targetIndices.length).toBe(2);
    });
  });
});
