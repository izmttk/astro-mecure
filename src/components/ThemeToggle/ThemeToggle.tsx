import { memo, useCallback, useEffect, useState } from 'react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

import IconSun from '~icons/tabler/sun';
import IconMoon from '~icons/tabler/moon';
import IconDeviceDesktop from '~icons/tabler/device-desktop';
import useTheme, { type Theme } from '@/hooks/useTheme';
import styles from './ThemeToggle.module.css';
import { twMerge } from 'tailwind-merge';
import Menu from '../Menu';

const itemClassName = twMerge(
  'px-2 py-0.5 outline-none cursor-pointer flex items-center rounded',
  'data-[highlighted]:bg-primary-400/20 dark:data-[highlighted]:bg-primary-600/30 data-[highlighted]:text-primary-600 dark:data-[highlighted]:text-primary-300',
  'data-[state=checked]:text-primary-600 dark:data-[state=checked]:text-primary-300'
);

export interface ThemeToggleProps extends React.PropsWithChildren<React.ComponentPropsWithoutRef<'button'>> {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}
// Please wrap this component with <NoSSR />
function ThemeToggle({
  open,
  onOpenChange,
  className,
  ...rest
}: ThemeToggleProps) {
  const { colorMode, theme, setTheme } = useTheme();
  const stateIcon = colorMode === 'light' ? <IconSun className='h-5 w-5' /> :
    colorMode === 'dark' ? <IconMoon className='h-5 w-5' /> : null;

  return (
    <DropdownMenu.Root modal={false} open={open} onOpenChange={onOpenChange}>
      <DropdownMenu.Trigger asChild>
        <button aria-label='Theme Toggle' className={twMerge(
          'h-[2.125rem] w-[2.125rem] flex items-center justify-center',
          'rounded-full bg-gradient-to-b from-gray-100/50 to-white/50 ring-1 ring-gray-900/5 dark:from-gray-500/30 dark:to-gray-400/30 dark:ring-white/20 shadow-lg shadow-gray-800/10',
          className,
        )} {...rest}>{stateIcon}</button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content className={twMerge(
          'plate-bg plate-shadow border-highlight min-w-[8rem]',
          'p-1 rounded-md z-50 text-sm',
          styles.dropdownMenuContent
        )} loop sideOffset={8} align='start' alignOffset={-8} collisionPadding={8}>
          <DropdownMenu.RadioGroup value={theme} onValueChange={value => setTheme(value as Theme)}>
            <DropdownMenu.RadioItem value='light' className={itemClassName}>
              <IconSun className='h-4 w-4 mr-1' />浅色
            </DropdownMenu.RadioItem>
            <DropdownMenu.RadioItem value='dark' className={itemClassName}>
              <IconMoon className='h-4 w-4 mr-1' />深色
            </DropdownMenu.RadioItem>
            <DropdownMenu.RadioItem value='auto' className={itemClassName}>
              <IconDeviceDesktop className='h-4 w-4 mr-1' />跟随系统
            </DropdownMenu.RadioItem>
          </DropdownMenu.RadioGroup>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}


const MemoThemeToggle = memo(ThemeToggle);

export default MemoThemeToggle;