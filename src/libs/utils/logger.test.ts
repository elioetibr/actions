import * as core from '@actions/core';
import { Logger, LogLevel, createLogger, logger } from './logger';

jest.mock('@actions/core');

const mockedCore = jest.mocked(core);

describe('Logger', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    test('creates logger with component name', () => {
      const log = new Logger('test-component');
      log.info('hello');
      expect(mockedCore.info).toHaveBeenCalledWith(
        expect.stringContaining('component="test-component"'),
      );
    });

    test('creates logger with default context', () => {
      const log = new Logger('test', { env: 'prod' });
      log.info('hello');
      expect(mockedCore.info).toHaveBeenCalledWith(expect.stringContaining('env="prod"'));
    });

    test('creates logger with empty default context', () => {
      const log = new Logger('test');
      log.info('msg');
      expect(mockedCore.info).toHaveBeenCalledWith('component="test" msg="msg"');
    });
  });

  describe('withContext', () => {
    test('creates child logger with merged context', () => {
      const parent = new Logger('comp', { region: 'us-east-1' });
      const child = parent.withContext({ env: 'staging' });

      child.info('test');
      expect(mockedCore.info).toHaveBeenCalledWith(expect.stringContaining('region="us-east-1"'));
      expect(mockedCore.info).toHaveBeenCalledWith(expect.stringContaining('env="staging"'));
    });

    test('child context overrides parent context', () => {
      const parent = new Logger('comp', { env: 'prod' });
      const child = parent.withContext({ env: 'staging' });

      child.info('test');
      expect(mockedCore.info).toHaveBeenCalledWith(expect.stringContaining('env="staging"'));
      expect(mockedCore.info).not.toHaveBeenCalledWith(expect.stringContaining('env="prod"'));
    });

    test('does not modify parent logger', () => {
      const parent = new Logger('comp', { env: 'prod' });
      parent.withContext({ extra: 'data' });

      parent.info('test');
      expect(mockedCore.info).not.toHaveBeenCalledWith(expect.stringContaining('extra='));
    });
  });

  describe('log levels', () => {
    test('debug calls core.debug', () => {
      const log = new Logger('test');
      log.debug('debug msg');
      expect(mockedCore.debug).toHaveBeenCalledWith('component="test" msg="debug msg"');
    });

    test('info calls core.info', () => {
      const log = new Logger('test');
      log.info('info msg');
      expect(mockedCore.info).toHaveBeenCalledWith('component="test" msg="info msg"');
    });

    test('warn calls core.warning', () => {
      const log = new Logger('test');
      log.warn('warn msg');
      expect(mockedCore.warning).toHaveBeenCalledWith('component="test" msg="warn msg"');
    });

    test('error calls core.error', () => {
      const log = new Logger('test');
      log.error('error msg');
      expect(mockedCore.error).toHaveBeenCalledWith('component="test" msg="error msg"');
    });
  });

  describe('formatMessage', () => {
    test('includes context in formatted message', () => {
      const log = new Logger('comp');
      log.info('msg', { key: 'val', num: 42 });
      expect(mockedCore.info).toHaveBeenCalledWith('component="comp" key="val" num=42 msg="msg"');
    });

    test('filters undefined values from context', () => {
      const log = new Logger('comp');
      log.info('msg', { present: 'yes', absent: undefined });
      expect(mockedCore.info).toHaveBeenCalledWith('component="comp" present="yes" msg="msg"');
    });

    test('merges default and per-call context', () => {
      const log = new Logger('comp', { default: true });
      log.info('msg', { extra: 'val' });
      expect(mockedCore.info).toHaveBeenCalledWith(expect.stringContaining('default=true'));
      expect(mockedCore.info).toHaveBeenCalledWith(expect.stringContaining('extra="val"'));
    });

    test('produces no context pairs when all values are undefined', () => {
      const log = new Logger('comp');
      log.info('msg', { a: undefined, b: undefined });
      expect(mockedCore.info).toHaveBeenCalledWith('component="comp" msg="msg"');
    });

    test('handles boolean context values', () => {
      const log = new Logger('comp');
      log.info('msg', { flag: false });
      expect(mockedCore.info).toHaveBeenCalledWith('component="comp" flag=false msg="msg"');
    });

    test('warn with context', () => {
      const log = new Logger('comp');
      log.warn('warning', { severity: 'high' });
      expect(mockedCore.warning).toHaveBeenCalledWith(
        'component="comp" severity="high" msg="warning"',
      );
    });
  });
});

describe('LogLevel', () => {
  test('has expected values', () => {
    expect(LogLevel.DEBUG).toBe('debug');
    expect(LogLevel.INFO).toBe('info');
    expect(LogLevel.WARN).toBe('warn');
    expect(LogLevel.ERROR).toBe('error');
  });
});

describe('createLogger', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('creates logger with component name', () => {
    const log = createLogger('my-component');
    log.info('test');
    expect(mockedCore.info).toHaveBeenCalledWith(
      expect.stringContaining('component="my-component"'),
    );
  });

  test('creates logger with context', () => {
    const log = createLogger('comp', { version: '1.0' });
    log.info('test');
    expect(mockedCore.info).toHaveBeenCalledWith(expect.stringContaining('version="1.0"'));
  });
});

describe('default loggers', () => {
  test('has docker logger', () => {
    expect(logger.docker).toBeInstanceOf(Logger);
  });

  test('has github logger', () => {
    expect(logger.github).toBeInstanceOf(Logger);
  });

  test('has version logger', () => {
    expect(logger.version).toBeInstanceOf(Logger);
  });

  test('has action logger', () => {
    expect(logger.action).toBeInstanceOf(Logger);
  });
});
