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
      'inline-flex items-center text-[0.8125rem] leading-none pl-1.5 pr-2 py-[0.1875rem]',
      !onlyText && 'rounded-full bg-gray-200/60 hover:bg-gray-200 transition duration-150 active:scale-90',
      !onlyText && 'dark:bg-gray-900/50 dark:hover:text-black dark:hover:bg-gray-200',
      !onlyText && 'border border-gray-500/25 dark:border-white/15',
      className
    )}><IconGridFill width='1em' height='1em' className='flex-none mr-0.5' /><span className='min-w-0 break-words'>{category.label}</span></Chip>
  )
}
