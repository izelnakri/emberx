/**
 * What `emberx dev` and `emberx serve` serve with: the content types, and the app's server
 * module, src/server.ts built, whose render() each page is rendered with when it renders on the
 * server.
 */
import type { Server, ServerResponse } from 'node:http';
import process from 'node:process';
import { pathToFileURL } from 'node:url';

export const TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
};

/** What src/server.ts exports for emberx: the document for a URL, rendered into the base HTML. */
export interface AppServer {
  render(url: string, baseHTML: string): Promise<{ url: string; status: number; html: string }>;
}

export function respond(
  response: ServerResponse,
  status: number,
  type: string,
  body: string | Uint8Array,
  headers: Record<string, string> = {},
): void {
  response.writeHead(status, { 'content-type': type, ...headers });
  response.end(body);
}

/** The server module built at `file`, which must export render(). */
export async function importServer(file: string): Promise<AppServer> {
  const server = await import(pathToFileURL(file).href);
  if (typeof server.render !== 'function') {
    throw new Error(
      `the server module exports no render(url, baseHTML): \`emberx new my-app --ssr\` writes a src/server.ts that does.`,
    );
  }
  return server;
}

/**
 * The page at `url`, rendered on the server: a redirect where its route redirected, its status
 * otherwise, and a 500 with the error when the render failed.
 */
export async function respondWithPage(
  response: ServerResponse,
  server: AppServer,
  url: string,
  baseHTML: string,
  headers: Record<string, string> = {},
): Promise<void> {
  try {
    const page = await server.render(url, baseHTML);
    if (page.url !== url) return respond(response, 302, TYPES['.txt'], '', { ...headers, location: page.url });

    respond(response, page.status, TYPES['.html'], page.html, headers);
  } catch (error) {
    const text = (error as Error).stack ?? String(error);
    console.error(`emberx: rendering ${url} failed\n${text}`);
    respond(response, 500, TYPES['.txt'], `rendering ${url} failed\n\n${text}`, headers);
  }
}

export async function listen(server: Server, port: number, host: string): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, host, () => resolve());
  });
}

/** Resolves with 0 once Ctrl-C, or a SIGTERM, has stopped the server. */
export function untilStopped(stop: () => Promise<void> | void): Promise<number> {
  return new Promise<number>((resolve) => {
    const stopped = async () => {
      await stop();
      resolve(0);
    };
    process.once('SIGINT', stopped);
    process.once('SIGTERM', stopped);
  });
}
