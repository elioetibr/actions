import { assertNever } from './assertNever';

describe('assertNever', () => {
  it('throws with the unexpected value', () => {
    expect(() => assertNever('unexpected' as never)).toThrow('Unexpected value: "unexpected"');
  });
});
