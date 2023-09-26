import { parseInput } from './parse-input';

describe('parseInput', () => {
  it('should parse input separated by whitespace or comma', () => {
    const parsed = parseInput(`

      ,
      1,2

      3,

      4
      5
      6

    `);
    expect(parsed).toEqual(['1', '2', '3', '4', '5', '6']);
  });
});
