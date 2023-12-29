import urlJoin from 'url-join';
import { BASE_URL } from '@/constants';

export { default as urlJoin } from 'url-join';

export function url(...paths: string[]): string {
  return urlJoin(BASE_URL, ...paths);
}

export function isUnderBaseUrl(path: string): boolean {
  return path.startsWith(BASE_URL);
}
