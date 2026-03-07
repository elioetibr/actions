const COMMENT_MARKER_PREFIX = '<!-- pullrequester-id:';
const COMMENT_MARKER_SUFFIX = '-->';

/**
 * Build an HTML comment marker for upsert-based commenting.
 * Used across all tracker implementations to identify existing comments.
 */
export function buildMarker(markerId: string): string {
  return `${COMMENT_MARKER_PREFIX} ${markerId} ${COMMENT_MARKER_SUFFIX}`;
}
