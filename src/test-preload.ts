/**
 * Bun test preload: sets up module mocks for ESM-only @actions/* packages
 * and patches jest compatibility gaps in Bun 1.3.x.
 *
 * Loaded via bunfig.toml [test] preload before any test file is evaluated.
 *
 * Cross-file mock isolation
 * -------------------------
 * Bun's `mock.module()` installs into a process-global registry. Mocks added
 * by one test file leak into all subsequent files. To keep the suite
 * deterministic we:
 *   1. Define every global mock inside `installGlobalMocks()`.
 *   2. Install them once at preload time.
 *   3. After every test file (`afterAll`), call `mock.restore()` (which
 *      tears down ALL module mocks, including the global ones we want) and
 *      then re-install the global baseline.
 *
 * Test-local mocks (declared via `jest.mock(...)` / `mock.module(...)` inside
 * a test file) are wiped by the `mock.restore()` call, eliminating cross-file
 * pollution while keeping the @actions/* baseline mocks always present.
 */
import { mock, jest, afterAll } from 'bun:test';

// ── @actions/core ────────────────────────────────────────────────────────────

function buildSummaryMock(): Record<string, ReturnType<typeof mock>> {
  const s = {
    addRaw: mock(),
    addEOL: mock(),
    write: mock().mockResolvedValue(undefined),
    clear: mock().mockResolvedValue(undefined),
    stringify: mock().mockReturnValue(''),
    isEmptyBuffer: mock().mockReturnValue(true),
    emptyBuffer: mock(),
    addDetails: mock(),
    addHeading: mock(),
    addTable: mock(),
    addCodeBlock: mock(),
    addList: mock(),
    addQuote: mock(),
    addLink: mock(),
    addSeparator: mock(),
    addImage: mock(),
    addBreak: mock(),
  };
  // Chain methods return the summary instance
  for (const fn of [
    s.addRaw,
    s.addEOL,
    s.emptyBuffer,
    s.addDetails,
    s.addHeading,
    s.addTable,
    s.addCodeBlock,
    s.addList,
    s.addQuote,
    s.addLink,
    s.addSeparator,
    s.addImage,
    s.addBreak,
  ]) {
    fn.mockReturnValue(s);
  }
  return s;
}

function installGlobalMocks(): void {
  mock.module('@actions/core', () => {
    const summary = buildSummaryMock();
    return {
      addPath: mock(),
      debug: mock(),
      endGroup: mock(),
      error: mock(),
      exportVariable: mock(),
      getBooleanInput: mock(),
      getIDToken: mock(),
      getInput: mock(),
      getMultilineInput: mock(),
      getState: mock(),
      group: mock(),
      info: mock(),
      isDebug: mock().mockReturnValue(false),
      markdownSummary: summary,
      notice: mock(),
      platform: { isLinux: mock(), isWindows: mock(), isMacOS: mock() },
      saveState: mock(),
      setCommandEcho: mock(),
      setFailed: mock(),
      setOutput: mock(),
      setSecret: mock(),
      startGroup: mock(),
      summary,
      toPlatformPath: mock(),
      toPosixPath: mock(),
      toWin32Path: mock(),
      warning: mock(),
      ExitCode: { Success: 0, Failure: 1 },
    };
  });

  mock.module('@actions/github', () => ({
    context: {
      repo: { owner: 'test-owner', repo: 'test-repo' },
      ref: 'refs/heads/main',
      sha: 'abc123',
      actor: 'test-actor',
      eventName: 'push',
      payload: {},
      workflow: 'test-workflow',
      job: 'test-job',
      runId: 1,
      runNumber: 1,
      apiUrl: 'https://api.github.com',
      serverUrl: 'https://github.com',
      graphqlUrl: 'https://api.github.com/graphql',
      issue: { owner: 'test-owner', repo: 'test-repo', number: 0 },
    },
    getOctokit: mock().mockReturnValue({
      paginate: mock(),
      rest: { issues: {}, repos: {}, pulls: {} },
    }),
  }));

  mock.module('@actions/exec', () => ({
    exec: mock().mockResolvedValue(0),
    getExecOutput: mock().mockResolvedValue({ exitCode: 0, stdout: '', stderr: '' }),
  }));

  mock.module('@docker/actions-toolkit/lib/exec', () => ({
    Exec: {
      exec: mock().mockResolvedValue({ stdout: '', stderr: '', exitCode: 0 }),
    },
  }));
}

installGlobalMocks();

// Re-install the global baseline after every test file so that test-local
// `mock.module(...)` / `jest.mock(...)` calls don't leak.
afterAll(() => {
  mock.restore();
  installGlobalMocks();
});

// ── jest.mock no-factory compatibility ───────────────────────────────────────
// Bun 1.3.x requires a factory for jest.mock(). For calls without a factory
// that target modules already pre-mocked above via mock.module(), we no-op.

// Cast through unknown because Bun's `jest` type uses an index signature for
// dynamic Jest-compat extensions; both the original `mock` and our replacement
// live on that signature.
const jestExt = jest as unknown as Record<string, unknown>;
type MockFn = (module: string, factory?: unknown, options?: unknown) => unknown;
const origMock = (jestExt['mock'] as MockFn).bind(jest);
jestExt['mock'] = (module: string, factory?: unknown, options?: unknown): unknown => {
  if (factory !== undefined) {
    return origMock(module, factory, options);
  }
  // No factory — the module should already be mocked via mock.module() above.
  // Silently skip to avoid "mock(module, fn) requires a function" error.
  return undefined;
};

// ── jest.mocked polyfill ─────────────────────────────────────────────────────
// jest.mocked(x) is a type-only helper in Jest; at runtime it returns x unchanged.
// Bun 1.3.x does not implement it.

if (!jestExt['mocked']) {
  jestExt['mocked'] = <T>(value: T): T => value;
}
