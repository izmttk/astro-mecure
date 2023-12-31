import { useState, useEffect } from 'react';
import { animated, useSpring } from '@react-spring/web';
import { thumbHashToDataURL } from 'thumbhash';

export interface BlurHashProps extends React.ComponentPropsWithoutRef<'div'>{
  src: string;
  blurhash?: string;
  fadeOut?: boolean;
}

function base64ToBinary(codes: string) {
  const isDOM = Boolean(
    typeof window !== 'undefined' &&
    window.document &&
    window.document.documentElement
  );
  return isDOM
    ? new Uint8Array(window.atob(codes).split('').map(x => x.charCodeAt(0)))
    : new Uint8Array(Buffer.from(codes, 'base64'));
}

function hashToDataURL(hash: string) {
  const binary = base64ToBinary(hash);
  return thumbHashToDataURL(binary);
}

function BlurHash({
  src,
  style,
  blurhash,
  fadeOut = true,
  ...rest
}: BlurHashProps) {
  const [loaded, setLoaded] = useState(false);
  const [showElement, setShowElement] = useState(true);
  const dataURL = blurhash ? hashToDataURL(blurhash) : undefined;
  useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      setLoaded(true);
    };
  }, [src]);
  const [fadeOutSpring, api] = useSpring(() => ({
    from: {
      opacity: 1,
    },
    to: {
      opacity: loaded ? 0 : 1,
    },
    config: {
      tension: 300,
      friction: 30,
    },
    onRest: () => {
      setShowElement(false);
    }
  }), [loaded]);


  return (
    fadeOut ? (
      showElement ? (
        dataURL && <animated.div style={{
            background : `url(${dataURL}) center/cover`,
            ...style,
            ...fadeOutSpring
          }} {...rest}></animated.div>
      ) : (
        null
      )
    ) : (
      dataURL && <div style={{
        background : `url(${dataURL}) center/cover`,
        ...style,
      }} {...rest}></div>
    )
  )
}

export default BlurHash;