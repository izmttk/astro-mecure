import { useSetAtom } from 'jotai';
import { useCallback } from 'react';
import { twMerge } from 'tailwind-merge';
import IconSearch from '~icons/tabler/search';
import { searchModelOpen as searchModelOpenAtom } from '@/store/atoms';
import useUncontrolled from '@/hooks/useUncontrolled';


export interface DearchToggleProps extends React.ComponentPropsWithoutRef<'button'> {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function SearchToggle({
  className,
  open,
  onOpenChange,
  ...rest
}: DearchToggleProps) {
  const [isOpen, setIsOpen] = useUncontrolled({
    value: open,
    defaultValue: false,
    onChange: onOpenChange
  });
  const setSearchModalOpen = useSetAtom(searchModelOpenAtom);
  const handleClick = useCallback(() => {
    setIsOpen(true);
    setSearchModalOpen(true);
  }, []);
  return (
    <button onClick={handleClick} aria-label='Search Toggle' className={twMerge(
      'h-[2.125rem] w-[2.125rem] flex items-center justify-center',
      'rounded-full bg-gradient-to-b from-gray-100/50 to-white/50 ring-1 ring-gray-900/5 dark:from-gray-500/30 dark:to-gray-400/30 dark:ring-white/20 shadow-lg shadow-gray-800/10',
      className,
    )} {...rest}><IconSearch className='h-5 w-5' /></button>
  )
}
