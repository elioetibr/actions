import type { ISummaryPayload } from './ISummaryPayload';

export interface ISummaryWriteResult {
  readonly characterCount: number;
  readonly wasCompacted: boolean;
}

export interface ISummaryService {
  readonly payload: ISummaryPayload;
  readonly compact: boolean;
  readonly compactThreshold: number;
  readonly overwrite: boolean;
  write(): Promise<ISummaryWriteResult>;
}
