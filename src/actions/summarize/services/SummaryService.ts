import type { IAgent } from '../../../agents/interfaces';
import { assertNever } from '../../../libs/utils/assertNever';
import type { ISummaryPayload } from '../interfaces/ISummaryPayload';
import type { ISummaryWriteResult, ISummaryService } from '../interfaces/ISummaryService';
import type {
  ISummarySection,
  SummaryStatus,
  ITableSection,
  IDetailsSection,
  IListSection,
  ICodeSection,
  IHeadingSection,
  IQuoteSection,
  IRawSection,
} from '../interfaces/ISummarySection';

// Matches all ANSI/VT100 escape sequences — equivalent to the ansi-regex pattern
// used by strip-ansi, inlined to avoid ESM-only dependency issues in Jest (CJS).
const ANSI_REGEX =
  /[\u001B\u009B][[\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\d/#&.:=?%@~_+]*)*|[a-zA-Z\d]+(?:;[-a-zA-Z\d/#&.:=?%@~_+]*)*)?\u0007)|(?:(?:\d{1,4}(?:;\d{0,4})*)?[\dA-PR-TZcf-nq-uy=><~]))/g;

function stripAnsi(input: string): string {
  return input.replace(ANSI_REGEX, '');
}

const STATUS_EMOJI: Record<SummaryStatus, string> = {
  success: '✅',
  failure: '❌',
  warning: '⚠️',
  info: 'ℹ️',
  cancelled: '🚫',
  skipped: '⏭️',
};

/**
 * Minimum content length within a section before it is eligible for compacting.
 */
const COMPACT_CONTENT_MIN_LENGTH = 500;

function renderTable(section: ITableSection): string {
  const rows = section.rows;
  if (rows.length === 0) {
    return '<table></table>\n';
  }

  let html = '<table>\n';

  for (const row of rows) {
    html += '<tr>';
    for (const cell of row) {
      if (typeof cell === 'string') {
        html += `<td>${cell}</td>`;
      } else {
        const tag = cell.header ? 'th' : 'td';
        const colspan = cell.colspan ? ` colspan="${cell.colspan}"` : '';
        const rowspan = cell.rowspan ? ` rowspan="${cell.rowspan}"` : '';
        html += `<${tag}${colspan}${rowspan}>${cell.data}</${tag}>`;
      }
    }
    html += '</tr>\n';
  }

  html += '</table>\n';
  return html;
}

function renderDetails(section: IDetailsSection): string {
  const content = stripAnsi(section.content);
  const open = section.open ? ' open' : '';
  return `<details${open}><summary>${section.summary}</summary>${content}</details>\n`;
}

function renderList(section: IListSection): string {
  const tag = section.ordered ? 'ol' : 'ul';
  const items = section.items.map(item => `<li>${stripAnsi(item)}</li>`).join('');
  return `<${tag}>${items}</${tag}>\n`;
}

function renderCode(section: ICodeSection): string {
  const content = stripAnsi(section.content);
  const langAttr = section.language ? ` lang="${section.language}"` : '';
  return `<pre${langAttr}><code>${content}</code></pre>\n`;
}

function renderHeading(section: IHeadingSection): string {
  const level = section.level ?? 3;
  return `<h${level}>${section.text}</h${level}>\n`;
}

function renderQuote(section: IQuoteSection): string {
  const text = stripAnsi(section.text);
  const cite = section.cite ? ` cite="${section.cite}"` : '';
  return `<blockquote${cite}><p>${text}</p></blockquote>\n`;
}

function renderRaw(section: IRawSection): string {
  return stripAnsi(section.content) + '\n';
}

function renderSection(section: ISummarySection): string {
  switch (section.type) {
    case 'table':
      return renderTable(section);
    case 'details':
      return renderDetails(section);
    case 'list':
      return renderList(section);
    case 'code':
      return renderCode(section);
    case 'heading':
      return renderHeading(section);
    case 'quote':
      return renderQuote(section);
    case 'raw':
      return renderRaw(section);
    case 'separator':
      return '<hr>\n';
    /* istanbul ignore next -- exhaustive type guard, unreachable when all union members are handled */
    default:
      return assertNever(section);
  }
}

/**
 * Determines whether a section is eligible for compacting.
 * Tables, headings, separators, and quotes are never collapsed.
 * Details, list, code, raw sections with content > threshold are eligible
 * only when not marked critical.
 */
function isCompactEligible(section: ISummarySection, sectionHtml: string): boolean {
  if (
    section.type === 'separator' ||
    section.type === 'table' ||
    section.type === 'heading' ||
    section.type === 'quote'
  ) {
    return false;
  }
  if ('critical' in section && section.critical === true) {
    return false;
  }
  return sectionHtml.length > COMPACT_CONTENT_MIN_LENGTH;
}

function getCompactLabel(section: ISummarySection): string {
  if (section.type === 'details') {
    return section.summary;
  }
  if (section.type === 'list' || section.type === 'code') {
    return section.heading ?? section.type;
  }
  // section.type === 'raw'
  return section.type;
}

function wrapInDetails(label: string, innerHtml: string): string {
  return `<details><summary>${label}</summary>${innerHtml}</details>\n`;
}

export class SummaryService implements ISummaryService {
  constructor(
    readonly payload: ISummaryPayload,
    readonly compact: boolean,
    readonly compactThreshold: number,
    readonly overwrite: boolean,
    private readonly agent: IAgent,
  ) {}

  async write(): Promise<ISummaryWriteResult> {
    const { title, status, sections = [] } = this.payload;

    // Build header
    const headerHtml = status
      ? `<h2>${STATUS_EMOJI[status]} ${title}</h2>\n`
      : `<h2>${title}</h2>\n`;

    // Render all sections
    const renderedSections = sections.map(section => renderSection(section));
    const fullHtml = headerHtml + renderedSections.join('');

    let finalHtml = fullHtml;
    let wasCompacted = false;

    if (this.compact && fullHtml.length > this.compactThreshold) {
      // Re-render with compacting applied
      const compactedParts: string[] = [headerHtml];

      for (const [i, section] of sections.entries()) {
        const sectionHtml = renderedSections[i] as string;

        if (isCompactEligible(section, sectionHtml)) {
          const label = getCompactLabel(section);
          compactedParts.push(wrapInDetails(label, sectionHtml));
        } else {
          compactedParts.push(sectionHtml);
        }
      }

      finalHtml = compactedParts.join('');
      wasCompacted = true;
    }

    await this.agent.writeSummary(finalHtml, this.overwrite);

    return { characterCount: finalHtml.length, wasCompacted };
  }
}
