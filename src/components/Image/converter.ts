// import { createCanvas, loadImage } from '@napi-rs/canvas';
import sharp from 'sharp';
import { rgbaToThumbHash, thumbHashToDataURL } from 'thumbhash';

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
  // const maxSize = 100;
  // const image = await loadImage(imagePath);
  // const width = image.width;
  // const height = image.height;

  // const scale = Math.min(maxSize / width, maxSize / height);
  // const resizedWidth = Math.floor(width * scale);
  // const resizedHeight = Math.floor(height * scale);

  // const canvas = createCanvas(resizedWidth, resizedHeight);
  // const ctx = canvas.getContext('2d');
  // ctx.drawImage(image, 0, 0, resizedWidth, resizedHeight);

  // const imageData = ctx.getImageData(0, 0, resizedWidth, resizedHeight);
  // const rgba = new Uint8Array(imageData.data.buffer);
    
  const maxSize = 100;
  const image = await sharp(imagePath);
  const {
    data: resizedImageData, 
    info: resizedInfo
  } = await image
    .resize(maxSize, maxSize, { fit: 'inside' })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const {width: resizedWidth, height: resizedHeight} = resizedInfo;
  const hash = rgbaToThumbHash(resizedWidth, resizedHeight, resizedImageData);
  return hash;
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