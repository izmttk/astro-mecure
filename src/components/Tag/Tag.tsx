import Chip from '../Chip';
import IconHashTagLine from '~icons/mingcute/hashtag-line';
import { twMerge } from 'tailwind-merge';

export interface TagsProps {
  className?: string;
  onlyText?: boolean;
  tag: {
    label: string;
    url: string;
  }
}
export default function Tag({
  className,
  onlyText = false,
  tag
}: TagsProps) {
  return (
    <Chip as='a' href={tag.url} className={twMerge(
      'inline-flex items-center text-[0.8125rem] leading-none pl-1.5 pr-2 py-[0.1875rem]',
      !onlyText && 'rounded-full bg-gray-200/60 hover:bg-gray-200 transition duration-150 active:scale-90',
      !onlyText && 'dark:bg-gray-900/50 dark:hover:text-black dark:hover:bg-gray-200',
      !onlyText && 'border border-gray-500/25 dark:border-white/15',
      className
    )}><IconHashTagLine width='1em' height='1em' className='mr-0.5' />{tag.label}</Chip>
  )
}
