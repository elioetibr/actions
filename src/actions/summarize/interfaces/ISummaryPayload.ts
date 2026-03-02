import type { ISummarySection, SummaryStatus } from './ISummarySection';

export interface ISummaryPayload {
  readonly title: string;
  readonly status?: SummaryStatus;
  readonly sections?: ISummarySection[];
}
