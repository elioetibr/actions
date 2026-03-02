import type { IAgent } from '../../../agents/interfaces';
import type { ISummaryPayload } from '../interfaces/ISummaryPayload';
import type { ISummarySection } from '../interfaces/ISummarySection';
import { SummaryService } from './SummaryService';

function createAgent(overrides: Partial<IAgent> = {}): IAgent {
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
    exec: jest.fn(),
    writeSummary: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

function createService(
  payload: ISummaryPayload,
  options: {
    compact?: boolean;
    compactThreshold?: number;
    overwrite?: boolean;
    agent?: IAgent;
  } = {},
): { service: SummaryService; agent: IAgent } {
  const agent = options.agent ?? createAgent();
  const service = new SummaryService(
    payload,
    options.compact ?? false,
    options.compactThreshold ?? 10000,
    options.overwrite ?? true,
    agent,
  );
  return { service, agent };
}

describe('SummaryService', () => {
  describe('constructor properties', () => {
    it('exposes readonly payload, compact, compactThreshold, and overwrite', () => {
      const payload: ISummaryPayload = { title: 'Test' };
      const { service } = createService(payload, {
        compact: true,
        compactThreshold: 5000,
        overwrite: false,
      });

      expect(service.payload).toBe(payload);
      expect(service.compact).toBe(true);
      expect(service.compactThreshold).toBe(5000);
      expect(service.overwrite).toBe(false);
    });
  });

  describe('write() — header rendering', () => {
    it('renders h2 without emoji when no status', async () => {
      const { service, agent } = createService({ title: 'My Summary' });

      await service.write();

      const html: string = (agent.writeSummary as jest.Mock).mock.calls[0][0];
      expect(html).toContain('<h2>My Summary</h2>');
    });

    it.each([
      ['success', '✅'],
      ['failure', '❌'],
      ['warning', '⚠️'],
      ['info', 'ℹ️'],
      ['cancelled', '🚫'],
      ['skipped', '⏭️'],
    ] as const)('renders h2 with %s emoji for status "%s"', async (status, emoji) => {
      const { service, agent } = createService({ title: 'Deploy', status });

      await service.write();

      const html: string = (agent.writeSummary as jest.Mock).mock.calls[0][0];
      expect(html).toContain(`<h2>${emoji} Deploy</h2>`);
    });
  });

  describe('write() — section rendering', () => {
    it('renders a heading section at the configured level', async () => {
      const sections: ISummarySection[] = [{ type: 'heading', text: 'Sub Title', level: 3 }];
      const { service, agent } = createService({ title: 'Test', sections });

      await service.write();

      const html: string = (agent.writeSummary as jest.Mock).mock.calls[0][0];
      expect(html).toContain('<h3>Sub Title</h3>');
    });

    it('defaults heading level to 3 when not provided', async () => {
      const sections: ISummarySection[] = [{ type: 'heading', text: 'Default Level' }];
      const { service, agent } = createService({ title: 'Test', sections });

      await service.write();

      const html: string = (agent.writeSummary as jest.Mock).mock.calls[0][0];
      expect(html).toContain('<h3>Default Level</h3>');
    });

    it('renders a separator section as <hr>', async () => {
      const sections: ISummarySection[] = [{ type: 'separator' }];
      const { service, agent } = createService({ title: 'Test', sections });

      await service.write();

      const html: string = (agent.writeSummary as jest.Mock).mock.calls[0][0];
      expect(html).toContain('<hr>');
    });

    it('renders a table section with th for header cells and td for data cells', async () => {
      const sections: ISummarySection[] = [
        {
          type: 'table',
          rows: [
            [
              { data: 'Name', header: true },
              { data: 'Value', header: true },
            ],
            ['alpha', 'beta'],
          ],
        },
      ];
      const { service, agent } = createService({ title: 'Test', sections });

      await service.write();

      const html: string = (agent.writeSummary as jest.Mock).mock.calls[0][0];
      expect(html).toContain('<table>');
      expect(html).toContain('<th>Name</th>');
      expect(html).toContain('<th>Value</th>');
      expect(html).toContain('<td>alpha</td>');
      expect(html).toContain('<td>beta</td>');
    });

    it('renders a table section with string cells as td', async () => {
      const sections: ISummarySection[] = [
        {
          type: 'table',
          rows: [['col1', 'col2']],
        },
      ];
      const { service, agent } = createService({ title: 'Test', sections });

      await service.write();

      const html: string = (agent.writeSummary as jest.Mock).mock.calls[0][0];
      expect(html).toContain('<td>col1</td><td>col2</td>');
    });

    it('renders a table section with colspan and rowspan attributes', async () => {
      const sections: ISummarySection[] = [
        {
          type: 'table',
          rows: [[{ data: 'Merged', header: false, colspan: '2', rowspan: '1' }]],
        },
      ];
      const { service, agent } = createService({ title: 'Test', sections });

      await service.write();

      const html: string = (agent.writeSummary as jest.Mock).mock.calls[0][0];
      expect(html).toContain('colspan="2"');
      expect(html).toContain('rowspan="1"');
    });

    it('renders an empty table', async () => {
      const sections: ISummarySection[] = [{ type: 'table', rows: [] }];
      const { service, agent } = createService({ title: 'Test', sections });

      await service.write();

      const html: string = (agent.writeSummary as jest.Mock).mock.calls[0][0];
      expect(html).toContain('<table></table>');
    });

    it('renders a details section closed by default', async () => {
      const sections: ISummarySection[] = [
        { type: 'details', summary: 'Click me', content: 'Inner content' },
      ];
      const { service, agent } = createService({ title: 'Test', sections });

      await service.write();

      const html: string = (agent.writeSummary as jest.Mock).mock.calls[0][0];
      expect(html).toContain('<details><summary>Click me</summary>Inner content</details>');
    });

    it('renders a details section as open when open=true', async () => {
      const sections: ISummarySection[] = [
        { type: 'details', summary: 'Expanded', content: 'body', open: true },
      ];
      const { service, agent } = createService({ title: 'Test', sections });

      await service.write();

      const html: string = (agent.writeSummary as jest.Mock).mock.calls[0][0];
      expect(html).toContain('<details open>');
    });

    it('renders an unordered list by default', async () => {
      const sections: ISummarySection[] = [{ type: 'list', items: ['one', 'two', 'three'] }];
      const { service, agent } = createService({ title: 'Test', sections });

      await service.write();

      const html: string = (agent.writeSummary as jest.Mock).mock.calls[0][0];
      expect(html).toContain('<ul>');
      expect(html).toContain('<li>one</li>');
      expect(html).toContain('<li>two</li>');
      expect(html).toContain('<li>three</li>');
      expect(html).toContain('</ul>');
    });

    it('renders an ordered list when ordered=true', async () => {
      const sections: ISummarySection[] = [
        { type: 'list', items: ['first', 'second'], ordered: true },
      ];
      const { service, agent } = createService({ title: 'Test', sections });

      await service.write();

      const html: string = (agent.writeSummary as jest.Mock).mock.calls[0][0];
      expect(html).toContain('<ol>');
      expect(html).toContain('</ol>');
    });

    it('renders a code section with lang attribute', async () => {
      const sections: ISummarySection[] = [
        { type: 'code', content: 'const x = 1;', language: 'typescript' },
      ];
      const { service, agent } = createService({ title: 'Test', sections });

      await service.write();

      const html: string = (agent.writeSummary as jest.Mock).mock.calls[0][0];
      expect(html).toContain('<pre lang="typescript"><code>const x = 1;</code></pre>');
    });

    it('renders a code section without lang attribute when language not provided', async () => {
      const sections: ISummarySection[] = [{ type: 'code', content: 'echo hello' }];
      const { service, agent } = createService({ title: 'Test', sections });

      await service.write();

      const html: string = (agent.writeSummary as jest.Mock).mock.calls[0][0];
      expect(html).toContain('<pre><code>echo hello</code></pre>');
    });

    it('renders a quote section with cite attribute', async () => {
      const sections: ISummarySection[] = [
        { type: 'quote', text: 'Some wisdom', cite: 'https://example.com' },
      ];
      const { service, agent } = createService({ title: 'Test', sections });

      await service.write();

      const html: string = (agent.writeSummary as jest.Mock).mock.calls[0][0];
      expect(html).toContain(
        '<blockquote cite="https://example.com"><p>Some wisdom</p></blockquote>',
      );
    });

    it('renders a quote section without cite attribute when not provided', async () => {
      const sections: ISummarySection[] = [{ type: 'quote', text: 'Another quote' }];
      const { service, agent } = createService({ title: 'Test', sections });

      await service.write();

      const html: string = (agent.writeSummary as jest.Mock).mock.calls[0][0];
      expect(html).toContain('<blockquote><p>Another quote</p></blockquote>');
    });

    it('renders a raw section with content as-is', async () => {
      const sections: ISummarySection[] = [{ type: 'raw', content: '<p>Custom HTML</p>' }];
      const { service, agent } = createService({ title: 'Test', sections });

      await service.write();

      const html: string = (agent.writeSummary as jest.Mock).mock.calls[0][0];
      expect(html).toContain('<p>Custom HTML</p>\n');
    });
  });

  describe('write() — empty sections array', () => {
    it('renders title-only summary with no sections', async () => {
      const { service, agent } = createService({ title: 'Just a Title', sections: [] });

      const result = await service.write();

      const html: string = (agent.writeSummary as jest.Mock).mock.calls[0][0];
      expect(html).toBe('<h2>Just a Title</h2>\n');
      expect(result.characterCount).toBe('<h2>Just a Title</h2>\n'.length);
      expect(result.wasCompacted).toBe(false);
    });

    it('renders title-only summary when sections is undefined', async () => {
      const { service, agent } = createService({ title: 'No Sections' });

      await service.write();

      const html: string = (agent.writeSummary as jest.Mock).mock.calls[0][0];
      expect(html).toBe('<h2>No Sections</h2>\n');
    });
  });

  describe('write() — return value', () => {
    it('returns characterCount equal to rendered HTML length', async () => {
      const { service } = createService({ title: 'Test' });

      const result = await service.write();

      expect(result.characterCount).toBe('<h2>Test</h2>\n'.length);
    });

    it('returns wasCompacted=false when compact=false', async () => {
      const { service } = createService({ title: 'Test' }, { compact: false });

      const result = await service.write();

      expect(result.wasCompacted).toBe(false);
    });
  });

  describe('write() — overwrite flag', () => {
    it('calls agent.writeSummary with overwrite=false when configured', async () => {
      const { service, agent } = createService({ title: 'Test' }, { overwrite: false });

      await service.write();

      expect(agent.writeSummary).toHaveBeenCalledWith(expect.any(String), false);
    });

    it('calls agent.writeSummary with overwrite=true when configured', async () => {
      const { service, agent } = createService({ title: 'Test' }, { overwrite: true });

      await service.write();

      expect(agent.writeSummary).toHaveBeenCalledWith(expect.any(String), true);
    });
  });

  describe('write() — compacting disabled', () => {
    it('does NOT compact even when content exceeds threshold', async () => {
      const longContent = 'x'.repeat(600);
      const sections: ISummarySection[] = [
        { type: 'raw', content: longContent },
        { type: 'raw', content: longContent },
      ];
      const { service } = createService(
        { title: 'Big', sections },
        { compact: false, compactThreshold: 10 },
      );

      const result = await service.write();

      expect(result.wasCompacted).toBe(false);
    });
  });

  describe('write() — compacting enabled, below threshold', () => {
    it('does not compact when content is below threshold', async () => {
      const sections: ISummarySection[] = [{ type: 'raw', content: 'short' }];
      const { service, agent } = createService(
        { title: 'Test', sections },
        { compact: true, compactThreshold: 100000 },
      );

      const result = await service.write();

      const html: string = (agent.writeSummary as jest.Mock).mock.calls[0][0];
      expect(result.wasCompacted).toBe(false);
      expect(html).toContain('short');
      expect(html).not.toContain('<details><summary>raw</summary>');
    });
  });

  describe('write() — compacting enabled, above threshold', () => {
    it('wraps eligible non-critical sections in <details> when threshold exceeded', async () => {
      const longContent = 'x'.repeat(600);
      const sections: ISummarySection[] = [{ type: 'raw', content: longContent }];
      const { service, agent } = createService(
        { title: 'Test', sections },
        { compact: true, compactThreshold: 50 },
      );

      const result = await service.write();

      const html: string = (agent.writeSummary as jest.Mock).mock.calls[0][0];
      expect(result.wasCompacted).toBe(true);
      expect(html).toContain('<details><summary>raw</summary>');
    });

    it('wraps a long code section with its heading as the label', async () => {
      const longContent = 'y'.repeat(600);
      const sections: ISummarySection[] = [
        { type: 'code', content: longContent, heading: 'Build Output', language: 'bash' },
      ];
      const { service, agent } = createService(
        { title: 'Test', sections },
        { compact: true, compactThreshold: 50 },
      );

      const result = await service.write();

      const html: string = (agent.writeSummary as jest.Mock).mock.calls[0][0];
      expect(result.wasCompacted).toBe(true);
      expect(html).toContain('<details><summary>Build Output</summary>');
    });

    it('wraps a long code section with its type as the label when no heading', async () => {
      const longContent = 'z'.repeat(600);
      const sections: ISummarySection[] = [
        { type: 'code', content: longContent, language: 'bash' },
      ];
      const { service, agent } = createService(
        { title: 'Test', sections },
        { compact: true, compactThreshold: 50 },
      );

      const result = await service.write();

      const html: string = (agent.writeSummary as jest.Mock).mock.calls[0][0];
      expect(result.wasCompacted).toBe(true);
      expect(html).toContain('<details><summary>code</summary>');
    });

    it('wraps a long list section with its heading as the label', async () => {
      const items = Array.from({ length: 60 }, (_, i) => `item-${i}-${'a'.repeat(20)}`);
      const sections: ISummarySection[] = [{ type: 'list', items, heading: 'File List' }];
      const { service, agent } = createService(
        { title: 'Test', sections },
        { compact: true, compactThreshold: 50 },
      );

      const result = await service.write();

      const html: string = (agent.writeSummary as jest.Mock).mock.calls[0][0];
      expect(result.wasCompacted).toBe(true);
      expect(html).toContain('<details><summary>File List</summary>');
    });

    it('wraps a long list section with type label when no heading', async () => {
      const items = Array.from({ length: 60 }, (_, i) => `item-${i}-${'b'.repeat(20)}`);
      const sections: ISummarySection[] = [{ type: 'list', items }];
      const { service, agent } = createService(
        { title: 'Test', sections },
        { compact: true, compactThreshold: 50 },
      );

      const result = await service.write();

      const html: string = (agent.writeSummary as jest.Mock).mock.calls[0][0];
      expect(result.wasCompacted).toBe(true);
      expect(html).toContain('<details><summary>list</summary>');
    });

    it('wraps a long details section using the summary as the label', async () => {
      const longContent = 'w'.repeat(600);
      const sections: ISummarySection[] = [
        { type: 'details', summary: 'My Details', content: longContent },
      ];
      const { service, agent } = createService(
        { title: 'Test', sections },
        { compact: true, compactThreshold: 50 },
      );

      const result = await service.write();

      const html: string = (agent.writeSummary as jest.Mock).mock.calls[0][0];
      expect(result.wasCompacted).toBe(true);
      expect(html).toContain('<details><summary>My Details</summary>');
    });

    it('does NOT wrap sections with content shorter than 500 chars', async () => {
      const shortContent = 'a'.repeat(100);
      const sections: ISummarySection[] = [{ type: 'raw', content: shortContent }];
      const { service } = createService(
        { title: 'Test', sections },
        { compact: true, compactThreshold: 10 },
      );

      const result = await service.write();

      expect(result.wasCompacted).toBe(true);
    });

    it('does NOT compact table sections', async () => {
      const rows = Array.from({ length: 100 }, (_, i) => [`row-${i}`, 'value']);
      const sections: ISummarySection[] = [{ type: 'table', rows }];
      const { service, agent } = createService(
        { title: 'Test', sections },
        { compact: true, compactThreshold: 50 },
      );

      const result = await service.write();

      const html: string = (agent.writeSummary as jest.Mock).mock.calls[0][0];
      // wasCompacted is true because threshold was exceeded but table itself is not wrapped
      expect(result.wasCompacted).toBe(true);
      expect(html).not.toContain('<details><summary>table</summary>');
      expect(html).toContain('<table>');
    });

    it('does NOT compact heading sections', async () => {
      const sections: ISummarySection[] = [{ type: 'heading', text: 'Section Header', level: 2 }];
      const { service, agent } = createService(
        { title: 'Test', sections },
        { compact: true, compactThreshold: 10 },
      );

      const result = await service.write();

      const html: string = (agent.writeSummary as jest.Mock).mock.calls[0][0];
      expect(result.wasCompacted).toBe(true);
      expect(html).toContain('<h2>Section Header</h2>');
      expect(html).not.toContain('<details><summary>heading</summary>');
    });

    it('does NOT compact separator sections', async () => {
      const longContent = 'v'.repeat(600);
      const sections: ISummarySection[] = [
        { type: 'raw', content: longContent },
        { type: 'separator' },
      ];
      const { service, agent } = createService(
        { title: 'Test', sections },
        { compact: true, compactThreshold: 50 },
      );

      const result = await service.write();

      const html: string = (agent.writeSummary as jest.Mock).mock.calls[0][0];
      expect(result.wasCompacted).toBe(true);
      expect(html).toContain('<hr>');
    });

    it('does NOT compact quote sections', async () => {
      const sections: ISummarySection[] = [{ type: 'quote', text: 'Quote text' }];
      const { service, agent } = createService(
        { title: 'Test', sections },
        { compact: true, compactThreshold: 10 },
      );

      const result = await service.write();

      const html: string = (agent.writeSummary as jest.Mock).mock.calls[0][0];
      expect(result.wasCompacted).toBe(true);
      expect(html).toContain('<blockquote>');
      expect(html).not.toContain('<details><summary>quote</summary>');
    });
  });

  describe('write() — critical sections survive compacting', () => {
    it('does NOT wrap a critical raw section even when content is long', async () => {
      const longContent = 'c'.repeat(600);
      const sections: ISummarySection[] = [{ type: 'raw', content: longContent, critical: true }];
      const { service, agent } = createService(
        { title: 'Test', sections },
        { compact: true, compactThreshold: 50 },
      );

      const result = await service.write();

      const html: string = (agent.writeSummary as jest.Mock).mock.calls[0][0];
      // wasCompacted is true because threshold exceeded, but the critical section itself is not wrapped
      expect(result.wasCompacted).toBe(true);
      expect(html).not.toContain('<details><summary>raw</summary>');
      expect(html).toContain(longContent);
    });

    it('does NOT wrap a critical code section', async () => {
      const longContent = 'd'.repeat(600);
      const sections: ISummarySection[] = [{ type: 'code', content: longContent, critical: true }];
      const { service, agent } = createService(
        { title: 'Test', sections },
        { compact: true, compactThreshold: 50 },
      );

      const result = await service.write();

      const html: string = (agent.writeSummary as jest.Mock).mock.calls[0][0];
      expect(result.wasCompacted).toBe(true);
      expect(html).not.toContain('<details><summary>code</summary>');
      expect(html).toContain('<pre><code>');
    });

    it('does NOT wrap a critical list section', async () => {
      const items = Array.from({ length: 60 }, (_, i) => `critical-item-${i}-${'e'.repeat(20)}`);
      const sections: ISummarySection[] = [{ type: 'list', items, critical: true }];
      const { service, agent } = createService(
        { title: 'Test', sections },
        { compact: true, compactThreshold: 50 },
      );

      const result = await service.write();

      const html: string = (agent.writeSummary as jest.Mock).mock.calls[0][0];
      expect(result.wasCompacted).toBe(true);
      expect(html).not.toContain('<details><summary>list</summary>');
      expect(html).toContain('<ul>');
    });

    it('does NOT wrap a critical details section', async () => {
      const longContent = 'f'.repeat(600);
      const sections: ISummarySection[] = [
        { type: 'details', summary: 'Important', content: longContent, critical: true },
      ];
      const { service, agent } = createService(
        { title: 'Test', sections },
        { compact: true, compactThreshold: 50 },
      );

      const result = await service.write();

      const html: string = (agent.writeSummary as jest.Mock).mock.calls[0][0];
      expect(result.wasCompacted).toBe(true);
      // critical details should appear as plain <details> not double-wrapped
      expect(html).toContain('<details><summary>Important</summary>');
      // should NOT be wrapped a second time
      const doubleWrapped = '<details><summary>Important</summary><details';
      expect(html).not.toContain(doubleWrapped);
    });

    it('compacts non-critical sections while preserving critical ones', async () => {
      const longContent = 'g'.repeat(600);
      const sections: ISummarySection[] = [
        { type: 'raw', content: longContent },
        { type: 'raw', content: longContent, critical: true },
      ];
      const { service, agent } = createService(
        { title: 'Test', sections },
        { compact: true, compactThreshold: 50 },
      );

      const result = await service.write();

      const html: string = (agent.writeSummary as jest.Mock).mock.calls[0][0];
      expect(result.wasCompacted).toBe(true);
      // non-critical wrapped
      expect(html).toContain('<details><summary>raw</summary>');
      // critical content still present unwrapped
      expect(html).toContain(longContent);
    });
  });

  describe('write() — ANSI stripping', () => {
    const ANSI_GREEN = '\u001B[32m';
    const ANSI_RESET = '\u001B[0m';

    it('strips ANSI codes from raw.content', async () => {
      const sections: ISummarySection[] = [
        { type: 'raw', content: `${ANSI_GREEN}green text${ANSI_RESET}` },
      ];
      const { service, agent } = createService({ title: 'Test', sections });

      await service.write();

      const html: string = (agent.writeSummary as jest.Mock).mock.calls[0][0];
      expect(html).toContain('green text');
      expect(html).not.toContain('\u001B');
    });

    it('strips ANSI codes from code.content', async () => {
      const sections: ISummarySection[] = [
        { type: 'code', content: `${ANSI_GREEN}npm run build${ANSI_RESET}` },
      ];
      const { service, agent } = createService({ title: 'Test', sections });

      await service.write();

      const html: string = (agent.writeSummary as jest.Mock).mock.calls[0][0];
      expect(html).toContain('npm run build');
      expect(html).not.toContain('\u001B');
    });

    it('strips ANSI codes from details.content', async () => {
      const sections: ISummarySection[] = [
        {
          type: 'details',
          summary: 'Logs',
          content: `${ANSI_GREEN}step passed${ANSI_RESET}`,
        },
      ];
      const { service, agent } = createService({ title: 'Test', sections });

      await service.write();

      const html: string = (agent.writeSummary as jest.Mock).mock.calls[0][0];
      expect(html).toContain('step passed');
      expect(html).not.toContain('\u001B');
    });

    it('strips ANSI codes from each item in list.items', async () => {
      const sections: ISummarySection[] = [
        {
          type: 'list',
          items: [`${ANSI_GREEN}item one${ANSI_RESET}`, `${ANSI_GREEN}item two${ANSI_RESET}`],
        },
      ];
      const { service, agent } = createService({ title: 'Test', sections });

      await service.write();

      const html: string = (agent.writeSummary as jest.Mock).mock.calls[0][0];
      expect(html).toContain('<li>item one</li>');
      expect(html).toContain('<li>item two</li>');
      expect(html).not.toContain('\u001B');
    });

    it('strips ANSI codes from quote.text', async () => {
      const sections: ISummarySection[] = [
        { type: 'quote', text: `${ANSI_GREEN}quoted text${ANSI_RESET}` },
      ];
      const { service, agent } = createService({ title: 'Test', sections });

      await service.write();

      const html: string = (agent.writeSummary as jest.Mock).mock.calls[0][0];
      expect(html).toContain('<p>quoted text</p>');
      expect(html).not.toContain('\u001B');
    });
  });
});
