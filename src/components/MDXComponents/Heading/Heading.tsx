import { twMerge } from 'tailwind-merge';
import IconH1 from '~icons/tabler/h-1';
import IconH2 from '~icons/tabler/h-2';
import IconH3 from '~icons/tabler/h-3';
import IconH4 from '~icons/tabler/h-4';
import IconH5 from '~icons/tabler/h-5';
import IconH6 from '~icons/tabler/h-6';


export interface HeadingProps extends React.PropsWithChildren<React.HTMLAttributes<HTMLHeadingElement>> {
  level: 1 | 2 | 3 | 4 | 5 | 6;
}

function getIcon(level: HeadingProps['level']) {
  switch(level) {
    case 1:
      return IconH1;
    case 2:
      return IconH2;
    case 3:
      return IconH3;
    case 4:
      return IconH4;
    case 5:
      return IconH5;
    case 6:
      return IconH6;
  }
}

export default function Heading({
  level,
  className,
  children,
  id,
  ...rest
}: HeadingProps) {
  const HeadingElement = `h${level}` as const;
  const HeadingIcon = getIcon(level);
  return (
    <HeadingElement id={id} className={twMerge(
      'group -ml-1 pl-1 md:-ml-5 md:pl-5 relative not-prose',
      className
    )} {...rest}>
      <a href={`#${id}`} className='absolute -left-6 top-1/2 translate-x-2 -translate-y-1/2 opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100' aria-hidden>
        <HeadingIcon className='w-6 h-6 p-1 text-slate-600 ring-1 ring-slate-300 rounded-md bg-white dark:bg-slate-700 dark:text-slate-300 dark:ring-slate-600' />
      </a>
      {children}
    </HeadingElement>
  )
}

export const H1 = (props: HeadingProps) => <Heading {...props} level={1}></Heading>
export const H2 = (props: HeadingProps) => <Heading {...props} level={2}></Heading>
export const H3 = (props: HeadingProps) => <Heading {...props} level={3}></Heading>
export const H4 = (props: HeadingProps) => <Heading {...props} level={4}></Heading>
export const H5 = (props: HeadingProps) => <Heading {...props} level={5}></Heading>
export const H6 = (props: HeadingProps) => <Heading {...props} level={6}></Heading>