import { ICommandFormatter } from './interfaces';
import { ICommandFormatterProvider } from './providers';
import { IDockerBuildXImageToolsProvider } from '../../actions/docker/buildx/images';
import { IStringListProvider } from '../providers';

export class CommandFormatter implements ICommandFormatter, ICommandFormatterProvider {
  constructor(
    readonly dockerProvider: IDockerBuildXImageToolsProvider,
    readonly stringListProvider: IStringListProvider,
  ) {}

  toStringMultiLineCommand(): string {
    const lines = this.buildAllLines();
    return this.stringListProvider.useStringList ? lines.join(' ') : lines.join('\n');
  }

  buildAllLines(): string[] {
    return [
      this.buildExecutorLine(),
      ...this.buildSubCommandLines(),
      this.buildMainCommandLine(),
      ...this.buildMetaDataLines(),
    ];
  }

  buildExecutorLine(): string {
    return this.stringListProvider.useStringList
      ? this.dockerProvider.executor
      : `${this.dockerProvider.executor}\\`;
  }

  buildSubCommandLines(): string[] {
    return this.dockerProvider.subCommands.map(subCommand =>
      this.stringListProvider.useStringList ? subCommand : `  ${subCommand}\\`,
    );
  }

  buildMainCommandLine(): string {
    return this.stringListProvider.useStringList
      ? this.dockerProvider.command
      : `  ${this.dockerProvider.command}\\`;
  }

  buildMetaDataLines(): string[] {
    const lines: string[] = [];

    for (const [key, values] of this.dockerProvider.metaData) {
      if (key === '') {
        lines.push(...this.buildUnkeyedMetaData(values));
      } else {
        lines.push(...this.buildKeyedMetaData(key, values));
      }
    }

    return lines;
  }

  buildUnkeyedMetaData(values: string[]): string[] {
    return this.stringListProvider.useStringList ? values : values.map(value => `  ${value}\\`);
  }

  buildKeyedMetaData(key: string, values: string[]): string[] {
    if (this.stringListProvider.useStringList) {
      return [`${key}=${values.join(',')}`];
    }

    return values.map(value => `  ${key} ${value}\\`);
  }
}
