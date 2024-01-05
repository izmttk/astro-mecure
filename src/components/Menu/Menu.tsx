import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import styles from './Menu.module.css';

export interface MenuLinkItemConfig {
  label: string;
  url: string;
  icon?: string;
}

export interface MenuSubItemConfig {
  label: string;
  icon?: string;
  children: MenuConfig;
}

export interface MenuConfig extends Array<MenuSubItemConfig | MenuLinkItemConfig>{};

import IconChevronRight from '~icons/tabler/chevron-right';
import Icon from '../Icon';
import { twMerge } from 'tailwind-merge';

const itemClassName = twMerge(
  'outline-none cursor-pointer flex items-center',
  'relative',
  'data-[highlighted]:bg-primary-400/20 dark:data-[highlighted]:bg-primary-600/30 data-[highlighted]:text-primary-600 dark:data-[highlighted]:text-primary-300',
  'data-[state=checked]:text-primary-600 dark:data-[state=checked]:text-primary-300'
);

interface DropdownCascadeSubProps extends React.PropsWithChildren {
  menu: MenuConfig;
}

const DropdownCascadeSub = ({
  menu,
  children
}: DropdownCascadeSubProps) => {
  return (
    <DropdownMenu.Sub>
      <DropdownMenu.SubTrigger asChild>{children}</DropdownMenu.SubTrigger>
      <DropdownMenu.Portal>
        <DropdownMenu.SubContent className={twMerge(
          'plate-bg plate-shadow border-highlight min-w-[10rem]',
          'p-1 rounded-md z-50 text-sm leading-4',
          styles.dropdownMenuContent
        )} loop>
          {
            menu.map((subItem, index) => {
              if ('url' in subItem) {
                return (
                  <DropdownMenu.Item asChild className={twMerge(itemClassName, 'pl-[1.625rem] pr-2 py-1.5 rounded')} key={index}>
                    <a href={subItem.url}>
                      {subItem.icon && <Icon name={subItem.icon} width={16} height={16} className='absolute left-0 mx-1' />}
                      {subItem.label}
                    </a>
                  </DropdownMenu.Item>
                );
              } else {
                return (
                  <DropdownCascadeSub menu={subItem.children} >
                    <div className={twMerge(itemClassName, 'pl-[1.625rem] pr-1 py-1.5 rounded')}>
                      {subItem.icon && <Icon name={subItem.icon} width={16} height={16} className='absolute left-0 mx-1' />}
                      {subItem.label}
                      <IconChevronRight width='1em' height='1em' className='ml-auto' />
                    </div>
                  </DropdownCascadeSub>
                );
              }
            })
          }
        </DropdownMenu.SubContent>
      </DropdownMenu.Portal>
    </DropdownMenu.Sub>
  )
}

export interface MenuProps extends React.PropsWithChildren {
  menu: MenuConfig;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  size?: 'compact' | 'normal' | 'loose';
}

export default function Menu({
  menu,
  open,
  onOpenChange,
  size = 'normal',
  children
}: MenuProps) {
  return (
    <DropdownMenu.Root modal={false} open={open} onOpenChange={onOpenChange}>
      <DropdownMenu.Trigger asChild>{children}</DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content className={twMerge(
          'plate-bg plate-shadow border-highlight z-50',
          size === 'loose' ? 'p-2 rounded-lg min-w-[14rem]' :
          size === 'compact' ? 'p-1 rounded-md min-w-[8rem] text-xs leading-3' :
          'p-1 rounded-md min-w-[10rem] text-sm leading-4',
          styles.dropdownMenuContent
        )} loop sideOffset={8} align='start' alignOffset={-8} collisionPadding={8}>
          {
            menu.map((subItem, index) => {
              if ('url' in subItem) {
                return (
                  <DropdownMenu.Item asChild className={twMerge(
                    itemClassName, 
                    size === 'loose' ? 'pl-8 pr-2 py-2.5 rounded-md' :
                    size === 'compact' ? 'pl-6 pr-2 py-1 rounded' :
                    'pl-7 pr-2 py-1.5 rounded'
                  )} key={index}>
                    <a href={subItem.url}>
                      {subItem.icon && <Icon name={subItem.icon} width={16} height={16} className={twMerge(
                        'absolute -translate-x-1/2',
                        size === 'loose' ? 'left-4' :
                        size === 'compact' ? 'left-3' :
                        'left-3.5'
                      )} />}
                      {subItem.label}
                    </a>
                  </DropdownMenu.Item>
                );
              } else {
                return (
                  <DropdownCascadeSub menu={subItem.children} key={index}>
                    <div className={twMerge(
                      itemClassName,
                      size === 'loose' ? 'pl-8 pr-1 py-2.5 rounded-md' :
                      size === 'compact' ? 'pl-6 pr-1 py-1 rounded' :
                      'pl-7 pr-1 py-1.5 rounded'
                    )}>
                      {subItem.icon && <Icon name={subItem.icon} width={16} height={16} className={twMerge(
                        'absolute -translate-x-1/2',
                        size === 'loose' ? 'left-4' :
                        size === 'compact' ? 'left-3' :
                        'left-3.5'
                      )} />}
                      {subItem.label}
                      <IconChevronRight width='1em' height='1em' className='ml-auto' />
                    </div>
                  </DropdownCascadeSub>
                )
              }
            })
          }
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
