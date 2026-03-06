import yaml from 'js-yaml';
import type { ISummaryPayload } from './interfaces/ISummaryPayload';
import type { ISummarySection, SummaryStatus } from './interfaces/ISummarySection';

// Matches all ANSI/VT100 escape sequences — equivalent to the ansi-regex pattern
// used by strip-ansi, inlined to avoid ESM-only dependency issues in Jest (CJS).
const ANSI_REGEX =
  /[\u001B\u009B][[\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\d/#&.:=?%@~_+]*)*|[a-zA-Z\d]+(?:;[-a-zA-Z\d/#&.:=?%@~_+]*)*)?\u0007)|(?:(?:\d{1,4}(?:;\d{0,4})*)?[\dA-PR-TZcf-nq-uy=><~]))/g;

function stripAnsi(input: string): string {
  return input.replace(ANSI_REGEX, '');
}

export type PayloadFormat = 'json' | 'yaml' | 'markdown';

export interface IParseResult {
  payload: ISummaryPayload;
  format: PayloadFormat;
}

export class PayloadParseError extends Error {
  constructor(
    message: string,
    public readonly format: PayloadFormat,
  ) {
    super(message);
    this.name = 'PayloadParseError';
  }
}

const VALID_STATUSES: ReadonlySet<string> = new Set([
  'success',
  'failure',
  'warning',
  'info',
  'cancelled',
  'skipped',
]);

const VALID_SECTION_TYPES: ReadonlySet<string> = new Set([
  'table',
  'details',
  'list',
  'code',
  'heading',
  'quote',
  'raw',
  'separator',
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function validatePayload(raw: Record<string, unknown>, format: PayloadFormat): ISummaryPayload {
  if (typeof raw['title'] !== 'string' || raw['title'].trim() === '') {
    throw new PayloadParseError(`"title" must be a non-empty string`, format);
  }

  const title = raw['title'].trim();
  let status: SummaryStatus | undefined;
  let sections: ISummarySection[] | undefined;

  if (raw['status'] !== undefined) {
    if (typeof raw['status'] !== 'string' || !VALID_STATUSES.has(raw['status'])) {
      throw new PayloadParseError(
        `"status" must be one of: ${[...VALID_STATUSES].join(', ')}`,
        format,
      );
    }
    status = raw['status'] as SummaryStatus;
  }

  if (raw['sections'] !== undefined) {
    if (!Array.isArray(raw['sections'])) {
      throw new PayloadParseError(`"sections" must be an array`, format);
    }
    for (const section of raw['sections']) {
      if (
        !isRecord(section) ||
        typeof section['type'] !== 'string' ||
        !VALID_SECTION_TYPES.has(section['type'])
      ) {
        throw new PayloadParseError(
          `Each section must have a "type" field with one of: ${[...VALID_SECTION_TYPES].join(', ')}`,
          format,
        );
      }
    }
    sections = raw['sections'] as ISummarySection[];
  }

  const result: ISummaryPayload = { title };
  if (status !== undefined) {
    (result as { status: SummaryStatus }).status = status;
  }
  if (sections !== undefined) {
    (result as { sections: ISummarySection[] }).sections = sections;
  }

  return result;
}

function extractMarkdownTitle(content: string): string {
  const match = /^#{1,3}\s+(.+)/m.exec(content);
  const heading = match?.[1];
  return heading ? heading.trim() : 'Summary';
}

export class PayloadParser {
  static parse(raw: string): IParseResult {
    const cleaned = stripAnsi(raw).trim();

    // Detect JSON: must start with '{'
    if (cleaned.startsWith('{')) {
      let parsed: Record<string, unknown>;
      try {
        // Input starts with '{', so JSON.parse always yields an object
        parsed = JSON.parse(cleaned) as Record<string, unknown>;
      } catch (err) {
        throw new PayloadParseError(`Invalid JSON: ${(err as SyntaxError).message}`, 'json');
      }
      return { payload: validatePayload(parsed, 'json'), format: 'json' };
    }

    // Detect YAML: try to parse as an object with 'title'
    try {
      const parsed = yaml.load(cleaned);
      if (isRecord(parsed)) {
        if (typeof parsed['title'] === 'string' && parsed['title'].trim() !== '') {
          return { payload: validatePayload(parsed, 'yaml'), format: 'yaml' };
        }
      }
    } catch {
      // yaml.load threw — fall through to Markdown
    }

    // Fallback: Markdown
    const title = extractMarkdownTitle(cleaned);
    return {
      payload: {
        title,
        sections: [{ type: 'raw', content: cleaned }],
      },
      format: 'markdown',
    };
  }
}
