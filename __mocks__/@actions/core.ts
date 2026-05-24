import { jest } from 'bun:test';
export const debug = jest.fn();
export const info = jest.fn();
export const warning = jest.fn();
export const error = jest.fn();
export const setFailed = jest.fn();
export const getInput = jest.fn();
export const getBooleanInput = jest.fn();
export const setOutput = jest.fn();
export const startGroup = jest.fn();
export const endGroup = jest.fn();
export const addPath = jest.fn();
export const exportVariable = jest.fn();
export const setSecret = jest.fn();
export const getState = jest.fn();
export const saveState = jest.fn();
export const notice = jest.fn();
export const setCommandEcho = jest.fn();
export const isDebug = jest.fn().mockReturnValue(false);
export const summary = {
  addRaw: jest.fn().mockReturnThis(),
  addEOL: jest.fn().mockReturnThis(),
  write: jest.fn().mockResolvedValue(undefined),
  clear: jest.fn().mockResolvedValue(undefined),
  stringify: jest.fn().mockReturnValue(''),
  isEmptyBuffer: jest.fn().mockReturnValue(true),
  emptyBuffer: jest.fn().mockReturnThis(),
  addDetails: jest.fn().mockReturnThis(),
  addHeading: jest.fn().mockReturnThis(),
  addTable: jest.fn().mockReturnThis(),
  addCodeBlock: jest.fn().mockReturnThis(),
  addList: jest.fn().mockReturnThis(),
  addQuote: jest.fn().mockReturnThis(),
  addLink: jest.fn().mockReturnThis(),
  addSeparator: jest.fn().mockReturnThis(),
  addImage: jest.fn().mockReturnThis(),
  addBreak: jest.fn().mockReturnThis(),
};
export const markdownSummary = summary;
export const ExitCode = { Success: 0, Failure: 1 };
