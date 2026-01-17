import { SemanticVersionBuilder } from './SemanticVersionBuilder';

export class SemanticVersionFactory {
  static createDevelopment(version: string) {
    return SemanticVersionBuilder.fromVersion(version)
      .withMaxLength(500)
      .withControlCharacters(true)
      .build();
  }

  static createProduction(version: string) {
    return SemanticVersionBuilder.fromVersion(version)
      .withMaxLength(256)
      .withControlCharacters(false)
      .withMaxVersionNumber(999999)
      .build();
  }

  static createStrict(version: string) {
    const strictRegex = /^(\d+)\.(\d+)\.(\d+)$/;
    return SemanticVersionBuilder.fromVersion(version)
      .withCustomRegex(strictRegex)
      .withMaxVersionNumber(999)
      .build();
  }
}
