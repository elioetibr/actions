export interface ISemanticVersionProvider {
  readonly majorMinorPatch: string;
  readonly majorMinor: string;
  readonly major: string;
  readonly minor: string;
  readonly patch: string;
  readonly semVerSuffix: string;
  readonly semVer: string;
  readonly version: string;
}
