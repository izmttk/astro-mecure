import { useStore } from '@nanostores/react';
import React, { useCallback } from 'react'
import { twMerge } from 'tailwind-merge'
import IconSearch from '~icons/tabler/search';
import { searchModelOpen as searchModelOpenStore } from '@/store/states';
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
  const handleClick = useCallback(() => {
    setIsOpen(true);
    searchModelOpenStore.set(true);
  }, []);
  return (
    <button onClick={handleClick} aria-label='Search Toggle' className={twMerge(
      'p-1.5 rounded-full bg-gray-400/30 dark:bg-600/30',
      className,
    )} {...rest}><IconSearch className='h-[1.125rem] w-[1.125rem] m-px' /></button>
  )
}
