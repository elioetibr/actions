import type { IAgent, IExecOptions, IExecResult } from '../../agents/interfaces';
import type {
  ISummaryService,
  ISummaryWriteResult,
} from '../../actions/summarize/interfaces/ISummaryService';
import { SummarizeRunner, createSummarizeRunner } from './runner';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

jest.mock('../../actions/summarize/SummaryBuilder', () => {
  const mockService: Partial<ISummaryService> = {
    payload: { title: 'Test' },
    compact: true,
    compactThreshold: 900_000,
    overwrite: true,
    write: jest.fn<Promise<ISummaryWriteResult>, []>().mockResolvedValue({
      characterCount: 42,
      wasCompacted: false,
    }),
  };

  return {
    SummaryBuilder: {
      create: jest.fn().mockReturnValue({
        withPayload: jest.fn().mockReturnThis(),
        withCompact: jest.fn().mockReturnThis(),
        withCompactThreshold: jest.fn().mockReturnThis(),
        withOverwrite: jest.fn().mockReturnThis(),
        withAgent: jest.fn().mockReturnThis(),
        build: jest.fn().mockReturnValue(mockService),
      }),
    },
    __mockService: mockService,
  };
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getMockService(): jest.Mocked<ISummaryService> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const mod = require('../../actions/summarize/SummaryBuilder') as {
    __mockService: jest.Mocked<ISummaryService>;
  };
  return mod.__mockService;
}

function createMockAgent(
  overrides: Partial<Record<string, string | boolean>> = {},
): jest.Mocked<IAgent> {
  const inputs: Record<string, string> = {
    payload: JSON.stringify({ title: 'CI Report', status: 'success' }),
    compact: 'true',
    'compact-threshold': '900000',
    overwrite: 'true',
    ...Object.fromEntries(Object.entries(overrides).filter(([, v]) => typeof v === 'string')),
  };

  const booleans: Record<string, boolean> = {
    compact: true,
    overwrite: true,
  };

  // Apply boolean overrides
  for (const [key, val] of Object.entries(overrides)) {
    if (typeof val === 'boolean') {
      booleans[key] = val;
    }
  }

  return {
    getInput: jest.fn().mockImplementation((name: string) => inputs[name] ?? ''),
    getBooleanInput: jest.fn().mockImplementation((name: string) => booleans[name] ?? false),
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
    // IAgent.exec — safe via @actions/exec (execFile, not shell)
    exec: jest.fn<Promise<IExecResult>, [string, string[]?, IExecOptions?]>().mockResolvedValue({
      exitCode: 0,
      stdout: '',
      stderr: '',
    }),
    writeSummary: jest.fn<Promise<void>, [string, boolean?]>().mockResolvedValue(undefined),
  } as jest.Mocked<IAgent>;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('SummarizeRunner', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset write mock to default success result
    getMockService().write.mockResolvedValue({ characterCount: 42, wasCompacted: false });
  });

  describe('createSummarizeRunner', () => {
    it('returns a SummarizeRunner instance with correct name', () => {
      const runner = createSummarizeRunner();
      expect(runner).toBeInstanceOf(SummarizeRunner);
      expect(runner.name).toBe('summarize');
    });
  });

  describe('unknown step', () => {
    it('returns failure for an unknown step name', async () => {
      const agent = createMockAgent();
      const runner = createSummarizeRunner();

      const result = await runner.run(agent, 'invalid');

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain("Unknown step 'invalid'");
      expect(result.error?.message).toContain('summarize');
    });
  });

  describe('write step', () => {
    it('returns success with format-detected=json for a valid JSON payload', async () => {
      const jsonPayload = JSON.stringify({ title: 'CI Report', status: 'success' });
      const agent = createMockAgent({ payload: jsonPayload });
      const runner = createSummarizeRunner();

      getMockService().write.mockResolvedValue({ characterCount: 150, wasCompacted: false });

      const result = await runner.run(agent, 'write');

      expect(result.success).toBe(true);
      expect(result.outputs['format-detected']).toBe('json');
      expect(result.outputs['character-count']).toBe(150);
      expect(result.outputs['was-compacted']).toBe('false');
    });

    it('returns success with format-detected=yaml for a valid YAML payload', async () => {
      const yamlPayload = 'title: "Deploy Report"\nstatus: success\n';
      const agent = createMockAgent({ payload: yamlPayload });
      const runner = createSummarizeRunner();

      getMockService().write.mockResolvedValue({ characterCount: 80, wasCompacted: false });

      const result = await runner.run(agent, 'write');

      expect(result.success).toBe(true);
      expect(result.outputs['format-detected']).toBe('yaml');
    });

    it('returns success with format-detected=markdown for a Markdown payload', async () => {
      const markdownPayload = '# My Workflow Summary\n\nAll steps completed successfully.';
      const agent = createMockAgent({ payload: markdownPayload });
      const runner = createSummarizeRunner();

      getMockService().write.mockResolvedValue({ characterCount: 60, wasCompacted: false });

      const result = await runner.run(agent, 'write');

      expect(result.success).toBe(true);
      expect(result.outputs['format-detected']).toBe('markdown');
    });

    it('returns failure for invalid JSON starting with {', async () => {
      const invalidJson = '{ not valid json }';
      const agent = createMockAgent({ payload: invalidJson });
      const runner = createSummarizeRunner();

      const result = await runner.run(agent, 'write');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('sets was-compacted to "false" when compacting was not applied', async () => {
      const jsonPayload = JSON.stringify({ title: 'Short Report' });
      const agent = createMockAgent({ payload: jsonPayload });
      const runner = createSummarizeRunner();

      getMockService().write.mockResolvedValue({ characterCount: 20, wasCompacted: false });

      const result = await runner.run(agent, 'write');

      expect(result.success).toBe(true);
      expect(result.outputs['was-compacted']).toBe('false');
    });

    it('sets was-compacted to "true" when compacting was applied', async () => {
      const jsonPayload = JSON.stringify({ title: 'Large Report' });
      const agent = createMockAgent({ payload: jsonPayload });
      const runner = createSummarizeRunner();

      getMockService().write.mockResolvedValue({ characterCount: 950_000, wasCompacted: true });

      const result = await runner.run(agent, 'write');

      expect(result.success).toBe(true);
      expect(result.outputs['was-compacted']).toBe('true');
    });

    it('calls agent.info with the detected format', async () => {
      const jsonPayload = JSON.stringify({ title: 'Report' });
      const agent = createMockAgent({ payload: jsonPayload });
      const runner = createSummarizeRunner();

      await runner.run(agent, 'write');

      expect(agent.info).toHaveBeenCalledWith(expect.stringContaining('json'));
    });

    it('uses compact-threshold from inputs when provided', async () => {
      const jsonPayload = JSON.stringify({ title: 'Report' });
      const agent = createMockAgent({ payload: jsonPayload, 'compact-threshold': '500000' });
      const runner = createSummarizeRunner();

      await runner.run(agent, 'write');

      const { SummaryBuilder } = jest.requireMock('../../actions/summarize/SummaryBuilder') as {
        SummaryBuilder: { create: jest.Mock };
      };
      const builderInstance = SummaryBuilder.create();
      expect(builderInstance.withCompactThreshold).toHaveBeenCalledWith(500_000);
    });

    it('returns failure when service.write() rejects', async () => {
      const jsonPayload = JSON.stringify({ title: 'Report' });
      const agent = createMockAgent({ payload: jsonPayload });
      const runner = createSummarizeRunner();

      getMockService().write.mockRejectedValue(new Error('Write failed'));

      const result = await runner.run(agent, 'write');

      expect(result.success).toBe(false);
      expect(result.error?.message).toBe('Write failed');
    });
  });
});
