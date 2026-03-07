import { CommitLogParser } from './CommitLogParser';
import type { ICommitEntry } from './CommitLogParser';

describe('CommitLogParser', () => {
  describe('parseSubject', () => {
    it('should parse conventional commit with type and scope', () => {
      const result = CommitLogParser.parseSubject('feat(auth): add OAuth2 support');
      expect(result.type).toBe('feat');
      expect(result.scope).toBe('auth');
      expect(result.subject).toBe('add OAuth2 support');
      expect(result.isBreaking).toBe(false);
    });

    it('should parse conventional commit without scope', () => {
      const result = CommitLogParser.parseSubject('fix: resolve login timeout');
      expect(result.type).toBe('fix');
      expect(result.scope).toBeUndefined();
      expect(result.subject).toBe('resolve login timeout');
    });

    it('should detect breaking change with !', () => {
      const result = CommitLogParser.parseSubject('feat!: remove deprecated API');
      expect(result.isBreaking).toBe(true);
      expect(result.type).toBe('feat');
    });

    it('should detect breaking change with scope and !', () => {
      const result = CommitLogParser.parseSubject('feat(api)!: change return type');
      expect(result.isBreaking).toBe(true);
      expect(result.scope).toBe('api');
    });

    it('should handle non-conventional commit', () => {
      const result = CommitLogParser.parseSubject('update dependencies');
      expect(result.type).toBeUndefined();
      expect(result.scope).toBeUndefined();
      expect(result.subject).toBe('update dependencies');
      expect(result.isBreaking).toBe(false);
    });

    it('should normalize type to lowercase', () => {
      const result = CommitLogParser.parseSubject('FEAT(Auth): add login');
      expect(result.type).toBe('feat');
    });
  });

  describe('parseRawLog', () => {
    it('should parse null-delimited git log output', () => {
      const raw = 'abc1234\0feat(auth): add OAuth2 support\0\0def5678\0fix: resolve timeout\0\0';
      const entries = CommitLogParser.parseRawLog(raw);
      expect(entries).toHaveLength(2);
      expect(entries[0].sha).toBe('abc1234');
      expect(entries[0].type).toBe('feat');
      expect(entries[0].scope).toBe('auth');
      expect(entries[1].type).toBe('fix');
    });

    it('should return empty array for empty input', () => {
      expect(CommitLogParser.parseRawLog('')).toEqual([]);
      expect(CommitLogParser.parseRawLog('  ')).toEqual([]);
    });

    it('should detect BREAKING CHANGE in body', () => {
      const raw = 'abc1234\0feat: new API\0BREAKING CHANGE: removed old endpoint\0';
      const entries = CommitLogParser.parseRawLog(raw);
      expect(entries[0].isBreaking).toBe(true);
    });

    it('should detect BREAKING-CHANGE in body', () => {
      const raw = 'abc1234\0feat: new API\0BREAKING-CHANGE: removed old endpoint\0';
      const entries = CommitLogParser.parseRawLog(raw);
      expect(entries[0].isBreaking).toBe(true);
    });

    it('should handle non-conventional commits in log', () => {
      const raw = 'abc1234\0update deps\0\0';
      const entries = CommitLogParser.parseRawLog(raw);
      expect(entries[0].type).toBeUndefined();
      expect(entries[0].subject).toBe('update deps');
    });

    it('should skip entries with empty sha or subject', () => {
      const raw = '\0\0body\0abc1234\0feat: real commit\0\0';
      const entries = CommitLogParser.parseRawLog(raw);
      expect(entries).toHaveLength(1);
      expect(entries[0].sha).toBe('abc1234');
    });

    it('should handle trailing incomplete group with only sha', () => {
      const raw = 'abc1234\0feat: commit one\0body1\0def5678';
      const entries = CommitLogParser.parseRawLog(raw);
      expect(entries).toHaveLength(1);
      expect(entries[0].sha).toBe('abc1234');
    });

    it('should handle trailing group missing body', () => {
      const raw = 'abc1234\0feat: commit one\0body1\0def5678\0fix: commit two';
      const entries = CommitLogParser.parseRawLog(raw);
      expect(entries).toHaveLength(2);
      expect(entries[1].sha).toBe('def5678');
      expect(entries[1].body).toBe('');
    });
  });

  describe('groupByType', () => {
    const entries: ICommitEntry[] = [
      { sha: 'a', subject: 'add OAuth2', body: '', type: 'feat', scope: 'auth', isBreaking: false },
      { sha: 'b', subject: 'fix timeout', body: '', type: 'fix', isBreaking: false },
      { sha: 'c', subject: 'update deps', body: '', isBreaking: false },
      { sha: 'd', subject: 'add tests', body: '', type: 'test', isBreaking: false },
      { sha: 'e', subject: 'another feature', body: '', type: 'feat', isBreaking: false },
    ];

    it('should group commits by type in standard order', () => {
      const groups = CommitLogParser.groupByType(entries);
      expect(groups[0].heading).toBe('Features');
      expect(groups[0].commits).toHaveLength(2);
      expect(groups[1].heading).toBe('Bug Fixes');
      expect(groups[1].commits).toHaveLength(1);
      expect(groups[2].heading).toBe('Tests');
      expect(groups[2].commits).toHaveLength(1);
    });

    it('should put non-conventional commits under Other Changes', () => {
      const groups = CommitLogParser.groupByType(entries);
      const other = groups.find(g => g.heading === 'Other Changes');
      expect(other).toBeDefined();
      expect(other!.commits).toHaveLength(1);
      expect(other!.commits[0].subject).toBe('update deps');
    });

    it('should return empty array for empty input', () => {
      expect(CommitLogParser.groupByType([])).toEqual([]);
    });
  });

  describe('renderMarkdown', () => {
    it('should render grouped commits as Markdown', () => {
      const groups = CommitLogParser.groupByType([
        {
          sha: 'abc1234def',
          subject: 'add OAuth2 support',
          body: '',
          type: 'feat',
          scope: 'auth',
          isBreaking: false,
        },
        {
          sha: 'def5678abc',
          subject: 'add user profile page',
          body: '',
          type: 'feat',
          isBreaking: false,
        },
        {
          sha: 'ghi9012def',
          subject: 'fix rate limiting',
          body: '',
          type: 'fix',
          scope: 'api',
          isBreaking: false,
        },
      ]);
      const md = CommitLogParser.renderMarkdown(groups);

      expect(md).toContain('### Features');
      expect(md).toContain('- **auth**: add OAuth2 support (abc1234)');
      expect(md).toContain('- add user profile page (def5678)');
      expect(md).toContain('### Bug Fixes');
      expect(md).toContain('- **api**: fix rate limiting (ghi9012)');
    });

    it('should show BREAKING prefix for breaking changes', () => {
      const groups = CommitLogParser.groupByType([
        { sha: 'abc1234def', subject: 'remove old API', body: '', type: 'feat', isBreaking: true },
      ]);
      const md = CommitLogParser.renderMarkdown(groups);
      expect(md).toContain('**BREAKING** remove old API');
    });

    it('should return empty string for empty groups', () => {
      expect(CommitLogParser.renderMarkdown([])).toBe('');
    });

    it('should omit SHA reference when sha is empty', () => {
      const groups = CommitLogParser.groupByType([
        {
          sha: '',
          subject: 'add feature',
          body: '',
          type: 'feat',
          isBreaking: false,
        },
      ]);
      const md = CommitLogParser.renderMarkdown(groups);

      expect(md).toContain('- add feature');
      expect(md).not.toContain('()');
    });
  });

  describe('generateChangelog', () => {
    it('should produce full changelog from raw log', () => {
      const raw = [
        'abc1234def5678\0feat(auth): add OAuth2 support\0\0',
        'def5678abc1234\0fix(api): fix rate limiting\0\0',
        'jkl3456def5678\0update dependencies\0\0',
      ].join('');
      const md = CommitLogParser.generateChangelog(raw);

      expect(md).toContain('### Features');
      expect(md).toContain('### Bug Fixes');
      expect(md).toContain('### Other Changes');
    });

    it('should return empty string for empty log', () => {
      expect(CommitLogParser.generateChangelog('')).toBe('');
    });
  });
});
