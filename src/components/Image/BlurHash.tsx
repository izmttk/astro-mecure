import { useState, useEffect } from 'react';
import useSSR from '@/hooks/useSSR';
import { thumbHashToDataURL } from 'thumbhash';
import { twMerge } from 'tailwind-merge';

export interface BlurHashProps extends React.ComponentPropsWithoutRef<'div'>{
  src: string;
  blurhash?: string;
}

function BlurHash({
  src,
  className,
  style,
  blurhash,
  ...rest
}: BlurHashProps) {
  const [loaded, setLoaded] = useState(false);
  const { isBrowser } = useSSR();
  const binary = blurhash ? (isBrowser
    ? new Uint8Array(window.atob(blurhash).split('').map(x => x.charCodeAt(0)))
    : new Uint8Array(Buffer.from(blurhash, 'base64'))) : undefined;
  const dataURL = binary ? thumbHashToDataURL(binary) : undefined;
  useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      setLoaded(true);
    };
  }, [src]);

  return (
    !loaded ? (dataURL ? (
      <div className={twMerge(
        className
      )} style={{
        background : `url(${dataURL}) center/cover`,
        ...style,
      }} {...rest}></div>
    ) : (
      null
    )) : null
  )
}

export default BlurHash;