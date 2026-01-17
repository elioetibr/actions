import { Exec as docker } from '@docker/actions-toolkit/lib/exec';
import { handleError } from './handlers';
import { MAX_INPUT_SIZE } from './constants';
import { parseFormattedString } from './parsers';
import { logger } from './logger';

const dockerLogger = logger.docker;

/**
 * Safely converts an object to a pretty JSON string
 * @param obj The object to convert
 * @param space Number of spaces for indentation
 * @returns Pretty JSON string or error message if conversion fails
 */
export function safePrettyJson(obj: any, space: number = 2): string {
  try {
    const jsonString = JSON.stringify(obj, null, space);
    // Escape common problematic characters
    return jsonString
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\t/g, '\\t');
  } catch (error) {
    return 'Invalid JSON object';
  }
}

/**
 * Process manifest images to format them properly for the buildx command
 * @param prefix The prefix to add before each image tag (--tag or --annotation)
 * @param manifestData The string containing image tags separated by newlines
 * @param options Configuration options for processing
 * @returns Formatted string with prefix and image tags
 */
export async function processManifestImages(
  prefix: string,
  manifestData: string[],
  options: {
    parseInput?: boolean;
    includePrefix?: boolean;
    useDebugLogging?: boolean;
  } = {}
): Promise<string[]> {
  const {
    parseInput = true,
    includePrefix = true,
    useDebugLogging = true
  } = options;

  const result: string[] = [];
  const inputData = parseInput ? await parseFormattedString(manifestData) : manifestData;
  const operation = prefix.replace('--', '').toUpperCase();

  if (useDebugLogging) {
    dockerLogger.debug('Generating manifest entries', { operation, count: inputData.length });
  }

  for (const item of inputData) {
    const trimmedItem = item.trim();
    if (trimmedItem) {
      if (useDebugLogging) {
        dockerLogger.debug('Processing manifest item', { prefix, item: trimmedItem });
      }

      if (includePrefix) {
        result.push(prefix, `"${trimmedItem}"`);
      } else {
        result.push(`${prefix} "${trimmedItem}"`);
      }
    }
  }

  return result;
}

/**
 * Process source images by pulling them and formatting for the buildx command
 * @param imageArchTags The string containing image tags separated by newlines
 * @param dryRun To Test without pull images
 * @param options Configuration options for processing
 * @returns Array of image tags
 */
export async function processSourceImages(
  imageArchTags: string[],
  dryRun: boolean,
  options: {
    parseInput?: boolean;
    addQuotes?: boolean;
    pullImages?: boolean;
  } = {}
): Promise<string[]> {
  const {
    parseInput = true,
    addQuotes = true,
    pullImages = true
  } = options;

  const result: string[] = [];

  try {
    const imageTags = parseInput ? await parseFormattedString(imageArchTags) : imageArchTags;

    for (const imageTag of imageTags) {
      const imageTagTrim = imageTag.trim();

      try {
        if (imageTagTrim) {
          if (pullImages) {
            const dockerExecArgs = ['pull', imageTagTrim];
            dockerLogger.info('Pulling image', { image: imageTagTrim, dryRun });

            if (!dryRun) {
              await docker.exec('docker', dockerExecArgs);
            } else {
              dockerLogger.info('DryRun: skipping docker pull', {
                command: `docker ${dockerExecArgs.join(' ')}`
              });
            }
          }

          result.push(addQuotes ? `"${imageTagTrim}"` : imageTagTrim);
        }
      } catch (error) {
        handleError(error);
      }
    }
  } catch (error) {
    handleError(error);
  }
  return result;
}

/**
 * Helper function to remove quotes from string
 * @param str - String to process
 * @returns String without quotes
 */
export function removeQuotes(str: string): string {
  // Remove quotes at beginning and end
  return str.replace(/^["'`]|["'`]$/g, '');
}

/**
 * Sanitizes actions by removing backticks and trimming
 * @param input - String actions to sanitize
 * @returns Sanitized string
 */
export function sanitizeInput(input: string): string {
  return input.trim().replace(/^`|`$/g, '');
}

/**
 * Limits string length to prevent DoS attacks
 * @param input - String to limit
 * @returns Limited string
 */
export function limitInputSize(input: string): string {
  return input.length > MAX_INPUT_SIZE ? input.substring(0, MAX_INPUT_SIZE) : input;
}

/**
 * Generate target manifest image tags (replaced by processManifestImages)
 * @deprecated Use processManifestImages with appropriate options instead
 * @param prefix The prefix to add before each image tag (--tag or --annotation)
 * @param inputs
 * @returns Formatted string with prefix and image tags
 */
export async function generateTargetManifestImageTags(
  prefix: string,
  inputs: string[],
): Promise<string[]> {
  return processManifestImages(prefix, inputs, {
    parseInput: false,
    includePrefix: true,
    useDebugLogging: false
  });
}

/**
 * Generate source image tags and pull (replaced by processSourceImages)
 * @deprecated Use processSourceImages with appropriate options instead
 * @param imageArchTags The string containing image tags separated by newlines
 * @param dryRun To Test without pull images
 * @returns Array of image tags
 */
export async function generateSourceImageTagsAndPull(
  imageArchTags: string[],
  dryRun: boolean,
): Promise<string[]> {
  return processSourceImages(imageArchTags, dryRun, {
    parseInput: false,
    addQuotes: true,
    pullImages: true
  });
}
