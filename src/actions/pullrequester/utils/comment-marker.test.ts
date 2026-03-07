import { buildMarker } from './comment-marker';

describe('buildMarker', () => {
  it('should build an HTML comment marker with the given ID', () => {
    expect(buildMarker('test-marker')).toBe('<!-- pullrequester-id: test-marker -->');
  });

  it('should include the marker ID in the output', () => {
    expect(buildMarker('my-custom-id')).toContain('my-custom-id');
  });

  it('should wrap in HTML comment syntax', () => {
    const marker = buildMarker('abc');
    expect(marker).toMatch(/^<!--.*-->$/);
  });

  it('should include the pullrequester-id prefix', () => {
    expect(buildMarker('foo')).toContain('pullrequester-id:');
  });

  it('should handle empty string marker ID', () => {
    expect(buildMarker('')).toBe('<!-- pullrequester-id:  -->');
  });

  it('should handle marker ID with special characters', () => {
    const marker = buildMarker('pr-123/issue-456');
    expect(marker).toBe('<!-- pullrequester-id: pr-123/issue-456 -->');
  });
});
