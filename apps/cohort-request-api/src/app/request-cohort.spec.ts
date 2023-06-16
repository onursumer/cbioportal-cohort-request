import { createHash } from './request-cohort';

describe('createHash', () => {
  it('should create hash', async () => {
    expect(createHash('study1,study2:case1,case2')).toEqual(
      'c73652eac9fbaa3ecca92c424167de60'
    );
  });
});
