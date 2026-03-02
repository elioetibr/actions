import type { IAgent } from '../../agents/interfaces';
import type { IBuilder } from '../../libs/services/types/interfaces/IBuilder';
import type { ISummaryPayload } from './interfaces/ISummaryPayload';
import type { ISummaryService } from './interfaces/ISummaryService';
import { SummaryService } from './services/SummaryService';

export class SummaryBuilder implements IBuilder<ISummaryService> {
  private _payload?: ISummaryPayload;
  private _compact = true;
  private _compactThreshold = 900_000;
  private _overwrite = true;
  private _agent?: IAgent;

  private constructor() {}

  static create(): SummaryBuilder {
    return new SummaryBuilder();
  }

  withPayload(payload: ISummaryPayload): this {
    this._payload = payload;
    return this;
  }

  withCompact(compact: boolean): this {
    this._compact = compact;
    return this;
  }

  withCompactThreshold(threshold: number): this {
    this._compactThreshold = threshold;
    return this;
  }

  withOverwrite(overwrite: boolean): this {
    this._overwrite = overwrite;
    return this;
  }

  withAgent(agent: IAgent): this {
    this._agent = agent;
    return this;
  }

  build(): ISummaryService {
    if (!this._payload) {
      throw new Error('SummaryBuilder: payload is required');
    }
    if (!this._payload.title || this._payload.title.trim() === '') {
      throw new Error('SummaryBuilder: payload.title must be a non-empty string');
    }
    if (this._compactThreshold <= 0) {
      throw new Error('SummaryBuilder: compactThreshold must be greater than 0');
    }
    if (!this._agent) {
      throw new Error('SummaryBuilder: agent is required');
    }
    return new SummaryService(
      this._payload,
      this._compact,
      this._compactThreshold,
      this._overwrite,
      this._agent,
    );
  }
}
