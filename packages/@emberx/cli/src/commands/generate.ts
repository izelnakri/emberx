/**
 * `emberx generate <kind> <name>`: a component, route, helper or service, with its test. See
 * `emberx help generate`.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { readArgs, UsageError } from '../args.ts';
import { findProject } from '../project.ts';
import { ROUTES_MARKER } from '../templates/app.ts';
import { blueprint, KINDS, type Kind } from '../templates/blueprints.ts';

export async function run(args: string[]): Promise<number> {
  const { values, positionals } = readArgs(args, {
    path: { type: 'string' },
    force: { type: 'boolean', short: 'f' },
  });
  if (values.help) return (await import('./help.ts')).run(['generate']);

  const [kind, name] = positionals;
  if (!KINDS.includes(kind as Kind) || !name || positionals.length > 2) {
    throw new UsageError(
      `give a kind, one of ${KINDS.join(', ')}, and a name: \`emberx generate component user-card\`.`,
    );
  } else if (!/^[a-z0-9][a-z0-9-]*(\/[a-z0-9][a-z0-9-]*)*$/.test(name)) {
    throw new UsageError(
      `"${name}" is no name: lowercase words with dashes, a folder before a slash, as in forms/text-input.`,
    );
  } else if (values.path && kind !== 'route') {
    throw new UsageError('--path is the URL of a route: only `generate route` takes it.');
  }

  const { root } = findProject();
  const { files, routeDefinition, hint } = blueprint(kind as Kind, name, { path: values.path as string | undefined });
  const existing = Object.keys(files).filter((path) => existsSync(join(root, path)));
  if (existing.length > 0 && !values.force) {
    throw new UsageError(
      `${existing.join(' and ')} exist${existing.length === 1 ? 's' : ''}: --force writes over them.`,
    );
  }

  for (const [path, contents] of Object.entries(files)) {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(join(root, path), contents);
    console.log(`  ${existing.includes(path) ? 'overwrite' : 'create'} ${path}`);
  }
  if (routeDefinition) addRoute(root, routeDefinition);
  if (hint) console.log(`\n${hint}`);

  return 0;
}

/** Adds `definition` to src/router.ts, above the line `emberx new` left for it, or says where it goes. */
function addRoute(root: string, definition: string): void {
  const router = join(root, 'src/router.ts');
  const source = existsSync(router) ? readFileSync(router, 'utf8') : '';
  const marker = source.split('\n').find((line) => line.trim() === ROUTES_MARKER);

  if (source.includes(definition)) {
    console.log('  src/router.ts has the route already');
  } else if (marker) {
    const indent = marker.slice(0, marker.indexOf(ROUTES_MARKER));
    writeFileSync(router, source.replace(marker, `${indent}${definition}\n${marker}`));
    console.log('  update src/router.ts');
  } else {
    console.log(`\nAdd the route to your Router.start() definitions:\n\n  ${definition}`);
  }
}
