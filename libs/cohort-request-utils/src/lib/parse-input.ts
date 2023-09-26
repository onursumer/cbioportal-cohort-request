import { chain } from 'lodash';

export function parseInput(
  input: string | undefined,
  separator: string | RegExp = /[,\s]+/
): string[] {
  return chain(input?.trim().split(separator)).compact().uniq().value();
}
