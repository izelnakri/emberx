/**
 * Each command's flags, read with node:util's parseArgs: an unknown flag, or one missing its
 * value, is a UsageError, which emberx reports with the way to get the command's help.
 */
import { parseArgs, type ParseArgsConfig } from 'node:util';

export class UsageError extends Error {}

type Options = NonNullable<ParseArgsConfig['options']>;

export function readArgs<T extends Options>(
  args: string[],
  options: T,
): { values: Record<keyof T | 'help', string | boolean | undefined>; positionals: string[] } {
  try {
    const { values, positionals } = parseArgs({
      args,
      options: { ...options, help: { type: 'boolean', short: 'h' } },
      allowPositionals: true,
      allowNegative: true,
      strict: true,
    });
    return { values: values as unknown as Record<keyof T | 'help', string | boolean | undefined>, positionals };
  } catch (error) {
    throw new UsageError((error as Error).message);
  }
}
