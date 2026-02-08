import type { IAgent } from '../../../agents/interfaces';

/**
 * Input settings for Docker ImageTools operations
 */
export interface IImageToolsSettings {
  ecrRegistry: string;
  ecrRepository: string;
  amd64MetaTags: string[];
  arm64MetaTags: string[];
  manifestMetaTags: string[];
  manifestMetaAnnotations: Record<string, string>;
  semVer: string;
  dryRun: boolean;
}

/**
 * Parsed version information
 */
export interface IVersionInfo {
  semVer: string;
  major: string;
  minor: string;
  patch: string;
  version: string;
  majorMinor: string;
  majorMinorPatch: string;
  semVerSuffix: string;
}

/**
 * Computed image information
 */
export interface IImageInfo {
  imageUri: string;
  amd64Tags: string[];
  arm64Tags: string[];
  manifestTags: string[];
}

/**
 * Parse comma or newline separated string to array
 */
function parseMultiValue(value: string): string[] {
  return value
    .split(/[,\n]/)
    .map((v) => v.trim())
    .filter((v) => v.length > 0);
}

/**
 * Parse annotations string to key-value pairs
 * Format: key1=value1,key2=value2 or key1=value1\nkey2=value2
 */
function parseAnnotations(value: string): Record<string, string> {
  const annotations: Record<string, string> = {};

  const entries = parseMultiValue(value);
  for (const entry of entries) {
    const [key, ...valueParts] = entry.split('=');
    if (key && valueParts.length > 0) {
      annotations[key.trim()] = valueParts.join('=').trim();
    }
  }

  return annotations;
}

/**
 * Get settings from agent inputs
 */
export function getSettings(agent: IAgent): IImageToolsSettings {
  const ecrRegistry = agent.getInput('ecrRegistry', true);
  const ecrRepository = agent.getInput('ecrRepository', true);
  const amd64MetaTags = parseMultiValue(agent.getInput('amd64MetaTags', true));
  const arm64MetaTags = parseMultiValue(agent.getInput('arm64MetaTags', true));
  const manifestMetaTags = parseMultiValue(agent.getInput('manifestMetaTags', true));
  const manifestMetaAnnotations = parseAnnotations(agent.getInput('manifestMetaAnnotations', true));
  const semVer = agent.getInput('semVer', true);
  const dryRun = agent.getBooleanInput('dryRun', false);

  return {
    ecrRegistry,
    ecrRepository,
    amd64MetaTags,
    arm64MetaTags,
    manifestMetaTags,
    manifestMetaAnnotations,
    semVer,
    dryRun,
  };
}

/**
 * Build full image URI
 */
export function buildImageUri(
  ecrRegistry: string,
  ecrRepository: string,
  tag?: string,
): string {
  const baseUri = `${ecrRegistry}/${ecrRepository}`;
  return tag ? `${baseUri}:${tag}` : baseUri;
}

/**
 * Build architecture-specific tags
 */
export function buildArchTags(
  ecrRegistry: string,
  ecrRepository: string,
  tags: string[],
): string[] {
  return tags.map((tag) => buildImageUri(ecrRegistry, ecrRepository, tag));
}
