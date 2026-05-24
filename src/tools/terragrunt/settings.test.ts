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

describe('terragrunt settings.getSettings', () => {
  it('returns parsed settings with sane defaults', () => {
    const agent = agentWith({ command: 'plan' });
    const settings = getSettings(agent);

    expect(settings.command).toBe('plan');
    expect(settings.workingDirectory).toBe('.');
    expect(settings.terraformVersionFile).toBe('.terraform-version');
    expect(settings.terragruntVersionFile).toBe('.terragrunt-version');
    expect(settings.runAll).toBe(false);
    expect(settings.includeDirs).toEqual([]);
    expect(settings.sourceMap).toEqual({});
  });

  it('parses overrides and propagates flags', () => {
    const agent = agentWith(
      {
        command: 'apply',
        variables: '{"env":"prod"}',
        'include-dirs': 'a,b',
        'source-map': '{"git::https://x":"local"}',
      },
      { 'run-all': true, 'non-interactive': true, 'strict-include': true },
    );
    const settings = getSettings(agent);

    expect(settings.command).toBe('apply');
    expect(settings.variables).toEqual({ env: 'prod' });
    expect(settings.includeDirs).toEqual(['a', 'b']);
    expect(settings.sourceMap).toEqual({ 'git::https://x': 'local' });
    expect(settings.runAll).toBe(true);
    expect(settings.nonInteractive).toBe(true);
    expect(settings.strictInclude).toBe(true);
  });

  it('throws on an invalid terragrunt command', () => {
    const agent = agentWith({ command: 'not-a-command' });
    expect(() => getSettings(agent)).toThrow(/Invalid terragrunt command: "not-a-command"/);
  });
});
