import urlJoin from 'url-join';
export { default as urlJoin } from 'url-join';

export function url(...paths: string[]): string {
  return urlJoin(import.meta.env.BASE_URL, ...paths);
}

export function isUnderBaseUrl(path: string): boolean {
  return path.startsWith(import.meta.env.BASE_URL);
}