import type { IAgent } from '../../agents/interfaces';

/**
 * Input settings for summarize operations
 */
export interface ISummarizeSettings {
  payload: string;
  compact: boolean;
  compactThreshold: number;
  overwrite: boolean;
}

/**
 * Get summarize settings from agent inputs
 */
export function getSettings(agent: IAgent): ISummarizeSettings {
  const compactThresholdRaw = agent.getInput('compact-threshold');
  return {
    payload: agent.getInput('payload', true),
    compact: agent.getBooleanInput('compact'),
    compactThreshold: compactThresholdRaw ? parseInt(compactThresholdRaw, 10) : 900_000,
    overwrite: agent.getBooleanInput('overwrite'),
  };
}
