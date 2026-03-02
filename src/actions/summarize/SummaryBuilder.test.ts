import type { IAgent, IExecOptions, IExecResult } from '../../agents/interfaces';
import { SummaryBuilder } from './SummaryBuilder';
import { SummaryService } from './services/SummaryService';

function makeMockAgent(): IAgent {
  return {
    getInput: jest.fn(),
    getBooleanInput: jest.fn(),
    getMultilineInput: jest.fn(),
    setOutput: jest.fn(),
    info: jest.fn(),
    warning: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    setFailed: jest.fn(),
    startGroup: jest.fn(),
    endGroup: jest.fn(),
    addPath: jest.fn(),
    exportVariable: jest.fn(),
    exec: jest.fn<Promise<IExecResult>, [string, string[]?, IExecOptions?]>(),
    writeSummary: jest.fn<Promise<void>, [string, boolean?]>(),
  };
}

const VALID_PAYLOAD = { title: 'Test Summary' };

function validBuilder(): SummaryBuilder {
  return SummaryBuilder.create().withPayload(VALID_PAYLOAD).withAgent(makeMockAgent());
}

describe('SummaryBuilder', () => {
  describe('create', () => {
    it('returns a new builder instance', () => {
      expect(SummaryBuilder.create()).toBeInstanceOf(SummaryBuilder);
    });
  });

  describe('fluent chaining', () => {
    it('supports method chaining', () => {
      const builder = SummaryBuilder.create()
        .withPayload(VALID_PAYLOAD)
        .withCompact(false)
        .withCompactThreshold(500_000)
        .withOverwrite(false)
        .withAgent(makeMockAgent());

      expect(builder).toBeInstanceOf(SummaryBuilder);
    });
  });

  describe('validation', () => {
    it('throws when payload is missing', () => {
      expect(() => SummaryBuilder.create().withAgent(makeMockAgent()).build()).toThrow(
        'SummaryBuilder: payload is required',
      );
    });

    it('throws when payload title is empty string', () => {
      expect(() =>
        SummaryBuilder.create().withPayload({ title: '' }).withAgent(makeMockAgent()).build(),
      ).toThrow('SummaryBuilder: payload.title must be a non-empty string');
    });

    it('throws when payload title is whitespace only', () => {
      expect(() =>
        SummaryBuilder.create().withPayload({ title: '   ' }).withAgent(makeMockAgent()).build(),
      ).toThrow('SummaryBuilder: payload.title must be a non-empty string');
    });

    it('throws when compactThreshold is zero', () => {
      expect(() =>
        SummaryBuilder.create()
          .withPayload(VALID_PAYLOAD)
          .withCompactThreshold(0)
          .withAgent(makeMockAgent())
          .build(),
      ).toThrow('SummaryBuilder: compactThreshold must be greater than 0');
    });

    it('throws when compactThreshold is negative', () => {
      expect(() =>
        SummaryBuilder.create()
          .withPayload(VALID_PAYLOAD)
          .withCompactThreshold(-1)
          .withAgent(makeMockAgent())
          .build(),
      ).toThrow('SummaryBuilder: compactThreshold must be greater than 0');
    });

    it('throws when agent is missing', () => {
      expect(() => SummaryBuilder.create().withPayload(VALID_PAYLOAD).build()).toThrow(
        'SummaryBuilder: agent is required',
      );
    });
  });

  describe('build', () => {
    it('returns a SummaryService instance with all params', () => {
      const agent = makeMockAgent();
      const payload = { title: 'My Report', status: 'success' as const };

      const service = SummaryBuilder.create()
        .withPayload(payload)
        .withCompact(false)
        .withCompactThreshold(500_000)
        .withOverwrite(false)
        .withAgent(agent)
        .build();

      expect(service).toBeInstanceOf(SummaryService);
      expect(service.payload).toBe(payload);
      expect(service.compact).toBe(false);
      expect(service.compactThreshold).toBe(500_000);
      expect(service.overwrite).toBe(false);
    });

    it('applies default values: compact=true, threshold=900_000, overwrite=true', () => {
      const service = validBuilder().build();

      expect(service.compact).toBe(true);
      expect(service.compactThreshold).toBe(900_000);
      expect(service.overwrite).toBe(true);
    });

    it('withCompact(false) is reflected on the service', () => {
      const service = validBuilder().withCompact(false).build();
      expect(service.compact).toBe(false);
    });

    it('withOverwrite(false) is reflected on the service', () => {
      const service = validBuilder().withOverwrite(false).build();
      expect(service.overwrite).toBe(false);
    });

    it('withCompactThreshold(500000) is reflected on the service', () => {
      const service = validBuilder().withCompactThreshold(500_000).build();
      expect(service.compactThreshold).toBe(500_000);
    });
  });
});
