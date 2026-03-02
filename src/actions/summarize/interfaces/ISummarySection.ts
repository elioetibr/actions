import type { SummaryTableRow } from '@actions/core/lib/summary';

export type SummaryStatus = 'success' | 'failure' | 'warning' | 'info' | 'cancelled' | 'skipped';

export interface ITableSection {
  type: 'table';
  heading?: string;
  rows: SummaryTableRow[];
  critical?: boolean;
}

export interface IDetailsSection {
  type: 'details';
  summary: string;
  content: string;
  open?: boolean;
  critical?: boolean;
}

export interface IListSection {
  type: 'list';
  heading?: string;
  items: string[];
  ordered?: boolean;
  critical?: boolean;
}

export interface ICodeSection {
  type: 'code';
  heading?: string;
  content: string;
  language?: string;
  critical?: boolean;
}

export interface IHeadingSection {
  type: 'heading';
  text: string;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  critical?: boolean;
}

export interface IQuoteSection {
  type: 'quote';
  text: string;
  cite?: string;
  critical?: boolean;
}

export interface IRawSection {
  type: 'raw';
  content: string;
  critical?: boolean;
}

export interface ISeparatorSection {
  type: 'separator';
}

export type ISummarySection =
  | ITableSection
  | IDetailsSection
  | IListSection
  | ICodeSection
  | IHeadingSection
  | IQuoteSection
  | IRawSection
  | ISeparatorSection;
