import { useSpring, animated } from '@react-spring/web';
import { useEffect, useRef, useState } from 'react'
import { twMerge } from 'tailwind-merge';

export interface BackgroundProps {
  bg: string;
}

const calc = (x: number, y: number, rect: DOMRect) => {
  const scale = 1.15;
  return [
    -1 * (x - rect.left - rect.width / 2) * (scale - 1),
    -1 * (y - rect.top - rect.height / 2) * (scale - 1),
    scale,
  ]
}

const trans = (x: number, y: number, s: number) =>
  `translateX(${x}px) translateY(${y}px) scale(${s})`


export default function Background({
  bg,
}: BackgroundProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [{ xys }, api] = useSpring(() => ({ 
    xys: [0, 0, 1], 
    config: {
      mass: 1,
      tension: 170,
      friction: 26,
    } 
  }));

  const handleMouseLeave = () =>
    api.start({
      xys: [0, 0, 1],
    })
  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = ref.current?.getBoundingClientRect();
    rect && api.start({
      xys: calc(e.clientX, e.clientY, rect),
    })
  }

  return (
    <div 
      className='w-full h-full'
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      ref={ref}
    >
      <animated.img style={{ transform: xys.to(trans) }} src={bg} className='w-full h-full object-cover pointer-events-none select-none transform-gpu' alt='background' loading='eager' />
    </div>
  )
}
