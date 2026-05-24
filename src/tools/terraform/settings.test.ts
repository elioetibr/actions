import type { IAgent } from '../../agents/interfaces';
import { getSettings } from './settings';

function agentWith(
  inputs: Record<string, string> = {},
  booleans: Record<string, boolean> = {},
): IAgent {
  return {
    getInput: jest.fn((name: string) => inputs[name] ?? ''),
    getBooleanInput: jest.fn((name: string) => booleans[name] ?? false),
    getMultilineInput: jest.fn().mockReturnValue([]),
    setOutput: jest.fn(),
    setFailed: jest.fn(),
    info: jest.fn(),
    warning: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    startGroup: jest.fn(),
    endGroup: jest.fn(),
    addPath: jest.fn(),
    exportVariable: jest.fn(),
    exec: jest.fn(),
    writeSummary: jest.fn(),
  } as unknown as IAgent;
}

describe('terraform settings.getSettings', () => {
  it('returns parsed settings with sane defaults', () => {
    const agent = agentWith({ command: 'plan' });
    const settings = getSettings(agent);

    expect(settings.command).toBe('plan');
    expect(settings.workingDirectory).toBe('.');
    expect(settings.terraformVersionFile).toBe('.terraform-version');
    expect(settings.variables).toEqual({});
    expect(settings.varFiles).toEqual([]);
    expect(settings.targets).toEqual([]);
    expect(settings.autoApprove).toBe(false);
  });

  it('parses lists, JSON, and overrides', () => {
    const agent = agentWith(
      {
        command: 'apply',
        'working-directory': 'infra',
        variables: '{"env":"prod"}',
        'var-files': 'a.tfvars,b.tfvars',
        targets: 'module.a,module.b',
      },
      { 'auto-approve': true },
    );
    const settings = getSettings(agent);

    expect(settings.command).toBe('apply');
    expect(settings.workingDirectory).toBe('infra');
    expect(settings.variables).toEqual({ env: 'prod' });
    expect(settings.varFiles).toEqual(['a.tfvars', 'b.tfvars']);
    expect(settings.targets).toEqual(['module.a', 'module.b']);
    expect(settings.autoApprove).toBe(true);
  });

  it('throws on an invalid terraform command', () => {
    const agent = agentWith({ command: 'not-a-command' });
    expect(() => getSettings(agent)).toThrow(/Invalid terraform command: "not-a-command"/);
  });
});
