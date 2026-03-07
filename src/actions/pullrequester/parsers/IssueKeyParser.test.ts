import { IssueKeyParser } from './IssueKeyParser';
import type { TrackerType } from '../interfaces';

describe('IssueKeyParser', () => {
  describe('extractFromText', () => {
    describe('github tracker', () => {
      const tracker: TrackerType = 'github';

      it('should extract #N patterns from text', () => {
        const result = IssueKeyParser.extractFromText('Closes #42, fixes #99', tracker);

        expect(result).toEqual([
          { tracker: 'github', project: '', number: 42, raw: '#42' },
          { tracker: 'github', project: '', number: 99, raw: '#99' },
        ]);
      });

      it('should extract owner/repo#N patterns', () => {
        const result = IssueKeyParser.extractFromText('See owner/repo#123 for details', tracker);

        expect(result).toEqual([
          {
            tracker: 'github',
            project: 'owner/repo',
            number: 123,
            raw: 'owner/repo#123',
          },
        ]);
      });

      it('should NOT match PROJ-123 patterns when tracker is github', () => {
        const result = IssueKeyParser.extractFromText('feature/PROJ-123-thing', tracker);

        expect(result).toEqual([]);
      });

      it('should deduplicate identical keys', () => {
        const result = IssueKeyParser.extractFromText('#42 and again #42', tracker);

        expect(result).toEqual([{ tracker: 'github', project: '', number: 42, raw: '#42' }]);
      });
    });

    describe('jira tracker', () => {
      const tracker: TrackerType = 'jira';

      it('should extract PROJ-N patterns from branch names', () => {
        const result = IssueKeyParser.extractFromText('feature/PROJ-123-add-login', tracker);

        expect(result).toEqual([
          {
            tracker: 'jira',
            project: 'PROJ',
            number: 123,
            raw: 'PROJ-123',
          },
        ]);
      });

      it('should extract multiple PROJ-N patterns from text', () => {
        const result = IssueKeyParser.extractFromText(
          'PROJ-123 PROJ-456: implement feature',
          tracker,
        );

        expect(result).toEqual([
          {
            tracker: 'jira',
            project: 'PROJ',
            number: 123,
            raw: 'PROJ-123',
          },
          {
            tracker: 'jira',
            project: 'PROJ',
            number: 456,
            raw: 'PROJ-456',
          },
        ]);
      });
    });

    describe('linear tracker', () => {
      const tracker: TrackerType = 'linear';

      it('should extract uppercase KEY-N patterns', () => {
        const result = IssueKeyParser.extractFromText('ENG-456-fix-bug', tracker);

        expect(result).toEqual([
          {
            tracker: 'linear',
            project: 'ENG',
            number: 456,
            raw: 'ENG-456',
          },
        ]);
      });

      it('should NOT match lowercase key patterns', () => {
        const result = IssueKeyParser.extractFromText('eng-456-fix-bug', tracker);

        expect(result).toEqual([]);
      });
    });

    describe('edge cases', () => {
      it('should return empty array for empty string', () => {
        expect(IssueKeyParser.extractFromText('', 'github')).toEqual([]);
      });

      it('should return empty array for whitespace-only string', () => {
        expect(IssueKeyParser.extractFromText('   ', 'jira')).toEqual([]);
      });

      it('should deduplicate identical keys in text', () => {
        const result = IssueKeyParser.extractFromText('PROJ-123 then PROJ-123 again', 'jira');

        expect(result).toEqual([
          {
            tracker: 'jira',
            project: 'PROJ',
            number: 123,
            raw: 'PROJ-123',
          },
        ]);
      });

      it('should skip github issues with number 0', () => {
        const result = IssueKeyParser.extractFromText('#0 and #42', 'github');

        expect(result).toEqual([{ tracker: 'github', project: '', number: 42, raw: '#42' }]);
      });

      it('should skip project keys with number 0', () => {
        const result = IssueKeyParser.extractFromText('PROJ-0 and PROJ-42', 'jira');

        expect(result).toEqual([{ tracker: 'jira', project: 'PROJ', number: 42, raw: 'PROJ-42' }]);
      });

      it('should throw via assertNever for unknown tracker type', () => {
        expect(() => IssueKeyParser.extractFromText('text', 'unknown' as TrackerType)).toThrow(
          'Unexpected value: "unknown"',
        );
      });
    });
  });

  describe('extractFromBranch', () => {
    it('should delegate to extractFromText and produce the same result', () => {
      const branch = 'feature/PROJ-123-add-login';
      const tracker: TrackerType = 'jira';

      const branchResult = IssueKeyParser.extractFromBranch(branch, tracker);
      const textResult = IssueKeyParser.extractFromText(branch, tracker);

      expect(branchResult).toEqual(textResult);
    });

    it('should extract github issue from branch with # prefix', () => {
      const result = IssueKeyParser.extractFromBranch('fix/#42-broken-css', 'github');

      expect(result).toEqual([{ tracker: 'github', project: '', number: 42, raw: '#42' }]);
    });

    it('should extract linear key from branch', () => {
      const result = IssueKeyParser.extractFromBranch('ENG-456-fix-bug', 'linear');

      expect(result).toEqual([
        {
          tracker: 'linear',
          project: 'ENG',
          number: 456,
          raw: 'ENG-456',
        },
      ]);
    });
  });
});
