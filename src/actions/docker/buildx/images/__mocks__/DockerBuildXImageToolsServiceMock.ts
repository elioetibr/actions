import { IDockerBuildXImageTools } from '../interfaces';

export const DockerBuildXImageToolsServiceMock = jest.fn().mockImplementation(
  (command: string, useStringList: boolean): IDockerBuildXImageTools => ({
    command,
    executor: 'docker',
    subCommands: ['buildx', 'imagetools'],
    useStringList,
    metaData: new Map(),
    setMetaData: jest.fn().mockReturnThis(),
    addMetaData: jest.fn().mockReturnThis(),
    getMetaData: jest.fn().mockReturnValue([]),
    getFirstMetaData: jest.fn().mockReturnValue(undefined),
    removeMetaData: jest.fn().mockReturnThis(),
    clearMetaData: jest.fn().mockReturnThis(),
    toCommandArgs: jest.fn().mockReturnValue([]),
    buildCommand: jest.fn().mockReturnValue(['docker', 'buildx', 'imagetools']),
    toString: jest.fn().mockReturnValue('DockerBuildXImageToolsService'),
    toStringMultiLineCommand: jest.fn().mockReturnValue('docker buildx imagetools'),
  }),
);
