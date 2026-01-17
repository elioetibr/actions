/**
 * Safely converts an object to a pretty JSON string
 * @param obj The object to convert
 * @param space Number of spaces for indentation
 * @returns Pretty JSON string or error message if conversion fails
 */
export declare function safePrettyJson(obj: any, space?: number): string;
/**
 * Process manifest images to format them properly for the buildx command
 * @param prefix The prefix to add before each image tag (--tag or --annotation)
 * @param manifestData The string containing image tags separated by newlines
 * @param options Configuration options for processing
 * @returns Formatted string with prefix and image tags
 */
export declare function processManifestImages(prefix: string, manifestData: string[], options?: {
    parseInput?: boolean;
    includePrefix?: boolean;
    useDebugLogging?: boolean;
}): Promise<string[]>;
/**
 * Process source images by pulling them and formatting for the buildx command
 * @param imageArchTags The string containing image tags separated by newlines
 * @param dryRun To Test without pull images
 * @param options Configuration options for processing
 * @returns Array of image tags
 */
export declare function processSourceImages(imageArchTags: string[], dryRun: boolean, options?: {
    parseInput?: boolean;
    addQuotes?: boolean;
    pullImages?: boolean;
}): Promise<string[]>;
/**
 * Helper function to remove quotes from string
 * @param str - String to process
 * @returns String without quotes
 */
export declare function removeQuotes(str: string): string;
/**
 * Sanitizes actions by removing backticks and trimming
 * @param input - String actions to sanitize
 * @returns Sanitized string
 */
export declare function sanitizeInput(input: string): string;
/**
 * Limits string length to prevent DoS attacks
 * @param input - String to limit
 * @returns Limited string
 */
export declare function limitInputSize(input: string): string;
/**
 * Generate target manifest image tags (replaced by processManifestImages)
 * @deprecated Use processManifestImages with appropriate options instead
 * @param prefix The prefix to add before each image tag (--tag or --annotation)
 * @param inputs
 * @returns Formatted string with prefix and image tags
 */
export declare function generateTargetManifestImageTags(prefix: string, inputs: string[]): Promise<string[]>;
/**
 * Generate source image tags and pull (replaced by processSourceImages)
 * @deprecated Use processSourceImages with appropriate options instead
 * @param imageArchTags The string containing image tags separated by newlines
 * @param dryRun To Test without pull images
 * @returns Array of image tags
 */
export declare function generateSourceImageTagsAndPull(imageArchTags: string[], dryRun: boolean): Promise<string[]>;
//# sourceMappingURL=common.d.ts.map