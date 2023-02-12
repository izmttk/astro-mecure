import React from 'react'
import IconGridFill from '~icons/mingcute/grid-fill'

import Chip from '../Chip';
import { twMerge } from 'tailwind-merge';

export interface CategoryProps {
  className?: string;
  onlyText?: boolean;
  category: {
    label: string;
    url: string;
  }
} 

export default function Category({
  className,
  onlyText = false,
  category
}: CategoryProps) {
  return (
    <Chip as='a' href={category.url} className={twMerge(
      'inline-flex items-center text-[0.8125rem] leading-none pl-1.5 pr-2 py-1',
      'text-gray-800 dark:text-white',
      !onlyText && 'rounded-full bg-gray-200/60 hover:bg-gray-200 transition duration-150 active:scale-90',
      !onlyText && 'dark:bg-gray-900/50 dark:hover:text-black dark:hover:bg-gray-200',
      !onlyText && 'ring-1 ring-gray-500/25 dark:ring-white/5',
      className
    )}><IconGridFill width='1em' height='1em' className='mr-0.5' />{category.label}</Chip>
  )
}
