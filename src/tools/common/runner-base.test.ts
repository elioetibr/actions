import type { IAgent, IRunnerResult } from '../../agents/interfaces';
import { RunnerBase } from './runner-base';

class TestRunner extends RunnerBase {
  override readonly name = 'test-runner';
  protected override readonly steps = new Map<string, (agent: IAgent) => Promise<IRunnerResult>>([
    ['ok', async () => this.success({ value: 1 })],
    [
      'fail-error',
      async () => {
        throw new Error('boom');
      },
    ],
    [
      'fail-string',
      async () => {
        throw 'string-thrown';
      },
    ],
    ['failure-helper-string', async () => this.failure('plain string failure')],
    ['failure-helper-with-outputs', async () => this.failure(new Error('e'), { partial: 'yes' })],
  ]);
}

function dummyAgent(): IAgent {
  return {} as unknown as IAgent;
}

describe('RunnerBase', () => {
  const runner = new TestRunner();

  it('returns an error result for an unknown step listing available steps', async () => {
    const result = await runner.run(dummyAgent(), 'missing');
    expect(result.success).toBe(false);
    expect(result.error?.message).toContain(`Unknown step 'missing' for runner 'test-runner'`);
    expect(result.error?.message).toContain('Available steps:');
    expect(result.error?.message).toContain('ok');
  });

  it('runs a known step and returns its success result', async () => {
    const result = await runner.run(dummyAgent(), 'ok');
    expect(result).toEqual({ success: true, outputs: { value: 1 } });
  });

  it('catches Error thrown by a step', async () => {
    const result = await runner.run(dummyAgent(), 'fail-error');
    expect(result.success).toBe(false);
    expect(result.error).toBeInstanceOf(Error);
    expect(result.error?.message).toBe('boom');
  });

  it('wraps non-Error throws into Error via String()', async () => {
    const result = await runner.run(dummyAgent(), 'fail-string');
    expect(result.success).toBe(false);
    expect(result.error).toBeInstanceOf(Error);
    expect(result.error?.message).toBe('string-thrown');
  });

  it('failure() accepts a string and wraps it into Error', async () => {
    const result = await runner.run(dummyAgent(), 'failure-helper-string');
    expect(result.success).toBe(false);
    expect(result.outputs).toEqual({});
    expect(result.error?.message).toBe('plain string failure');
  });

  it('failure() preserves outputs when provided', async () => {
    const result = await runner.run(dummyAgent(), 'failure-helper-with-outputs');
    expect(result.success).toBe(false);
    expect(result.outputs).toEqual({ partial: 'yes' });
    expect(result.error?.message).toBe('e');
  });
});
