import type { IAgent, IRunnerResult } from '../../agents/interfaces';
import { RunnerBase } from '../common/runner-base';
import { SummaryBuilder } from '../../actions/summarize/SummaryBuilder';
import { PayloadParser, PayloadParseError } from '../../actions/summarize/PayloadParser';
import { getSettings } from './settings';

/**
 * Summarize runner
 * Parses an input payload (JSON | YAML | Markdown) and writes
 * a structured summary to the GitHub Step Summary panel.
 */
export class SummarizeRunner extends RunnerBase {
  readonly name = 'summarize';

  protected readonly steps = new Map<string, (agent: IAgent) => Promise<IRunnerResult>>([
    ['write', this.runWrite.bind(this)],
  ]);

  private async runWrite(agent: IAgent): Promise<IRunnerResult> {
    try {
      const settings = getSettings(agent);

      const { payload, format } = PayloadParser.parse(settings.payload);

      const service = SummaryBuilder.create()
        .withPayload(payload)
        .withCompact(settings.compact)
        .withCompactThreshold(settings.compactThreshold)
        .withOverwrite(settings.overwrite)
        .withAgent(agent)
        .build();

      agent.info(`Format detected: ${format}`);
      const result = await service.write();

      return this.success({
        'character-count': result.characterCount,
        'was-compacted': String(result.wasCompacted),
        'format-detected': format,
      });
    } catch (error) {
      if (error instanceof PayloadParseError) {
        return this.failure(error);
      }
      return this.failure(error instanceof Error ? error : new Error(String(error)));
    }
  }
}

/**
 * Factory function to create a summarize runner
 */
export function createSummarizeRunner(): SummarizeRunner {
  return new SummarizeRunner();
}
