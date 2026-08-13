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
    <button type="button" onClick={handleClick} aria-label='打开搜索' className={twMerge(
      'h-10 w-10 flex items-center justify-center cursor-pointer rounded-full',
      className,
    )} {...rest}><IconSearch className='h-5 w-5' /></button>
  )
}
