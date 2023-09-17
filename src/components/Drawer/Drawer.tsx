import * as Dialog from '@radix-ui/react-dialog';

import styles from './Drawer.module.css';
import { twMerge } from 'tailwind-merge';
import IconX from '~icons/tabler/x'

export interface DrawerTriggerProps extends React.PropsWithChildren {
  
}

function DrawerTrigger({
  children
}: DrawerTriggerProps) {
  return (
    <Dialog.Trigger asChild>
      {children}
    </Dialog.Trigger>
  )
}

export interface DrawerContentProps extends React.PropsWithChildren<React.ComponentPropsWithoutRef<'div'>> {
  
}

function DrawerContent({
  children,
  className,
  ...rest
}: DrawerContentProps) {
  return (
    <Dialog.Portal>
      <Dialog.Overlay className={twMerge(
        'bg-gray-900/50 fixed inset-0 z-50',
        styles.drawerOverlay,
      )} />
      <Dialog.Content className={twMerge(
        'bg-background-light dark:bg-background-dark plate-shadow fixed z-50',
        'right-0 inset-y-0',
        'min-w-[16rem]',
        styles.drawerContent,
        className,
      )} {...rest}>
        {children}
      </Dialog.Content>
    </Dialog.Portal>
  )
}

export interface DrawerCloseProps extends React.PropsWithChildren<React.ComponentPropsWithoutRef<'button'>> {

}

function DrawerClose({
  children,
  className,
  ...rest
}: DrawerCloseProps) {
  return (
    <Dialog.Close className={twMerge(
      'bg-gray-400/20 rounded-md w-7 h-7 flex justify-center items-center',
      className,
    )} aria-label='close' {...rest}>
      {children ? children : <IconX />}
    </Dialog.Close>
  )
}


export interface DrawerProps extends React.PropsWithChildren {
  open?: boolean,
  onOpenChange?: (open: boolean) => void
}

function Drawer({
  children,
  open,
  onOpenChange,
  ...rest
}: DrawerProps) {
  return (
    <Dialog.Root modal open={open} onOpenChange={onOpenChange}>
      {children}
    </Dialog.Root>
  )
}
export default Object.assign(Drawer, {
  Trigger: DrawerTrigger,
  Content: DrawerContent,
  Close: DrawerClose,
})