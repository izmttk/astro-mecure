import { createCanvas, loadImage } from '@napi-rs/canvas';
import { rgbaToThumbHash, thumbHashToDataURL } from 'thumbhash';
import { DEV, DIST_DIR, FS_PREFIX } from '@/constants';
import urlJoin from 'url-join';

class Cache<T> {
  private cache: Map<string, T> = new Map();

  constructor(private loader: (key: string) => Promise<T>) {}

  async get(key: string) {
    if (this.cache.has(key)) {
      return this.cache.get(key) as T;
    } else {
      const value = await this.loader(key);
      this.cache.set(key, value);
      return value;
    }
  }
}

const hashCache = new Cache(hashLoader);

async function hashLoader(imagePath: string) {
  const maxSize = 100;
  const image = await loadImage(transformVitePath(imagePath));
  const width = image.width;
  const height = image.height;

  const scale = Math.min(maxSize / width, maxSize / height);
  const resizedWidth = Math.floor(width * scale);
  const resizedHeight = Math.floor(height * scale);

  const canvas = createCanvas(resizedWidth, resizedHeight);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(image, 0, 0, resizedWidth, resizedHeight);

  const imageData = ctx.getImageData(0, 0, resizedWidth, resizedHeight);
  const rgba = new Uint8Array(imageData.data.buffer);
  const hash = rgbaToThumbHash(resizedWidth, resizedHeight, rgba);
  return hash;
}

function transformVitePath(path: string) {
  if (DEV) {
    if (path.startsWith(FS_PREFIX)) {
      const prunedPath = new URL(path, 'http://localhost').pathname
      return prunedPath.slice(FS_PREFIX.length)
    } else {
      throw new Error(`Path "${path}" is not started with ${FS_PREFIX}`)
    }
  } else {
    return urlJoin(process.cwd(), DIST_DIR, path)
  }
}

// todo: performance optimization
export async function imageToHashBase64(imagePath: string) {
  const hash = await hashCache.get(imagePath);
  return Buffer.from(hash).toString('base64');
}

export async function imageToHashDataURL(imagePath: string) {
  const hash = await hashCache.get(imagePath);
  return thumbHashToDataURL(hash);
}