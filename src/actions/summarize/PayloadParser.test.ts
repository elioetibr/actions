import { PayloadParser, PayloadParseError } from './PayloadParser';
import type { PayloadFormat } from './PayloadParser';

describe('PayloadParser', () => {
  describe('JSON format', () => {
    it('parses JSON with all fields (title, status, sections)', () => {
      const input = JSON.stringify({
        title: 'Deployment Summary',
        status: 'success',
        sections: [{ type: 'raw', content: 'All checks passed.' }, { type: 'separator' }],
      });

      const result = PayloadParser.parse(input);

      expect(result.format).toBe('json');
      expect(result.payload.title).toBe('Deployment Summary');
      expect(result.payload.status).toBe('success');
      expect(result.payload.sections).toHaveLength(2);
      expect(result.payload.sections?.[0]).toEqual({ type: 'raw', content: 'All checks passed.' });
      expect(result.payload.sections?.[1]).toEqual({ type: 'separator' });
    });

    it('parses JSON with only title (no sections)', () => {
      const input = JSON.stringify({ title: 'Minimal Summary' });

      const result = PayloadParser.parse(input);

      expect(result.format).toBe('json');
      expect(result.payload.title).toBe('Minimal Summary');
      expect(result.payload.sections).toBeUndefined();
      expect(result.payload.status).toBeUndefined();
    });

    it('throws PayloadParseError when JSON has no title field', () => {
      const input = '{}';
      let thrownError: unknown;
      try {
        PayloadParser.parse(input);
      } catch (e) {
        thrownError = e;
      }

      expect(thrownError).toBeInstanceOf(PayloadParseError);
      expect((thrownError as PayloadParseError).format).toBe<PayloadFormat>('json');
      expect((thrownError as PayloadParseError).message).toMatch(
        /"title" must be a non-empty string/,
      );
    });

    it('throws PayloadParseError when JSON has empty title', () => {
      const input = JSON.stringify({ title: '' });
      let thrownError: unknown;
      try {
        PayloadParser.parse(input);
      } catch (e) {
        thrownError = e;
      }

      expect(thrownError).toBeInstanceOf(PayloadParseError);
      expect((thrownError as PayloadParseError).format).toBe<PayloadFormat>('json');
      expect((thrownError as PayloadParseError).message).toMatch(
        /"title" must be a non-empty string/,
      );
    });

    it('throws PayloadParseError with format json for invalid JSON starting with {', () => {
      const input = '{ not valid json !!';
      let thrownError: unknown;
      try {
        PayloadParser.parse(input);
      } catch (e) {
        thrownError = e;
      }

      expect(thrownError).toBeInstanceOf(PayloadParseError);
      expect((thrownError as PayloadParseError).format).toBe<PayloadFormat>('json');
      expect((thrownError as PayloadParseError).name).toBe('PayloadParseError');
      expect((thrownError as PayloadParseError).message).toMatch(/Invalid JSON/);
    });

    it('throws PayloadParseError for invalid status in JSON', () => {
      const input = JSON.stringify({ title: 'Test', status: 'unknown-status' });
      let thrownError: unknown;
      try {
        PayloadParser.parse(input);
      } catch (e) {
        thrownError = e;
      }

      expect(thrownError).toBeInstanceOf(PayloadParseError);
      expect((thrownError as PayloadParseError).format).toBe<PayloadFormat>('json');
      expect((thrownError as PayloadParseError).message).toMatch(/"status" must be one of/);
    });

    it('throws PayloadParseError when sections is not an array', () => {
      const input = JSON.stringify({ title: 'Test', sections: 'not-an-array' });
      let thrownError: unknown;
      try {
        PayloadParser.parse(input);
      } catch (e) {
        thrownError = e;
      }

      expect(thrownError).toBeInstanceOf(PayloadParseError);
      expect((thrownError as PayloadParseError).format).toBe<PayloadFormat>('json');
      expect((thrownError as PayloadParseError).message).toBe('"sections" must be an array');
    });

    it('throws PayloadParseError for an invalid section type', () => {
      const input = JSON.stringify({ title: 'Test', sections: [{ type: 'invalid-type' }] });
      let thrownError: unknown;
      try {
        PayloadParser.parse(input);
      } catch (e) {
        thrownError = e;
      }

      expect(thrownError).toBeInstanceOf(PayloadParseError);
      expect((thrownError as PayloadParseError).format).toBe<PayloadFormat>('json');
      expect((thrownError as PayloadParseError).message).toMatch(
        /Each section must have a "type" field/,
      );
    });

    it('strips ANSI codes from JSON content before parsing', () => {
      // ANSI escape: ESC[32m = green, ESC[0m = reset
      const ansiGreen = '\u001b[32m';
      const ansiReset = '\u001b[0m';
      const input = `${ansiGreen}${JSON.stringify({ title: 'Colored Title', status: 'success' })}${ansiReset}`;

      const result = PayloadParser.parse(input);

      expect(result.format).toBe('json');
      expect(result.payload.title).toBe('Colored Title');
      expect(result.payload.status).toBe('success');
    });
  });

  describe('YAML format', () => {
    it('parses YAML with sections', () => {
      const input = [
        'title: "CI Pipeline Summary"',
        'status: failure',
        'sections:',
        '  - type: raw',
        '    content: "Build failed at step 3."',
        '  - type: separator',
      ].join('\n');

      const result = PayloadParser.parse(input);

      expect(result.format).toBe('yaml');
      expect(result.payload.title).toBe('CI Pipeline Summary');
      expect(result.payload.status).toBe('failure');
      expect(result.payload.sections).toHaveLength(2);
      expect(result.payload.sections?.[0]).toEqual({
        type: 'raw',
        content: 'Build failed at step 3.',
      });
    });

    it('parses minimal YAML with only title', () => {
      const input = 'title: "Simple Report"';

      const result = PayloadParser.parse(input);

      expect(result.format).toBe('yaml');
      expect(result.payload.title).toBe('Simple Report');
      expect(result.payload.sections).toBeUndefined();
      expect(result.payload.status).toBeUndefined();
    });
  });

  describe('Markdown format', () => {
    it('extracts title from H1 heading and wraps content in raw section', () => {
      const input = '# My H1 Title\n\nSome description text.';

      const result = PayloadParser.parse(input);

      expect(result.format).toBe('markdown');
      expect(result.payload.title).toBe('My H1 Title');
      expect(result.payload.sections).toHaveLength(1);
      expect(result.payload.sections?.[0]).toEqual({ type: 'raw', content: input });
    });

    it('extracts title from H2 heading', () => {
      const input = '## My H2 Title\n\nSome description.';

      const result = PayloadParser.parse(input);

      expect(result.format).toBe('markdown');
      expect(result.payload.title).toBe('My H2 Title');
    });

    it('extracts title from H3 heading', () => {
      const input = '### My H3 Title\n\nSome description.';

      const result = PayloadParser.parse(input);

      expect(result.format).toBe('markdown');
      expect(result.payload.title).toBe('My H3 Title');
    });

    it('defaults title to "Summary" when no heading is found', () => {
      const input = 'Just some plain text with no heading at all.';

      const result = PayloadParser.parse(input);

      expect(result.format).toBe('markdown');
      expect(result.payload.title).toBe('Summary');
      expect(result.payload.sections).toHaveLength(1);
      expect(result.payload.sections?.[0]).toEqual({ type: 'raw', content: input });
    });

    it('strips ANSI codes from raw Markdown before parsing', () => {
      const ansiRed = '\u001b[31m';
      const ansiReset = '\u001b[0m';
      const input = `${ansiRed}# ANSI Title${ansiReset}\n\nRed content here.`;

      const result = PayloadParser.parse(input);

      expect(result.format).toBe('markdown');
      expect(result.payload.title).toBe('ANSI Title');
      // The stored content should be the cleaned version
      const rawSection = result.payload.sections?.[0];
      expect(rawSection?.type).toBe('raw');
      expect(rawSection).toEqual(
        expect.objectContaining({ type: 'raw', content: expect.not.stringContaining('\u001b[') }),
      );
    });
  });
});
