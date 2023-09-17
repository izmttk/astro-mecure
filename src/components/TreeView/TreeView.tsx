import { useContext, createContext, useState } from 'react'
import * as Collapsible from '@radix-ui/react-collapsible';
import IconChevronRight from '~icons/tabler/chevron-right';
import IconChevronDown from '~icons/tabler/chevron-down';
import styles from './TreeView.module.css';
import { twMerge } from 'tailwind-merge';

const ConfigContext = createContext<{
  icon?: React.ReactNode;
  expandIcon?: React.ReactNode;
  collapseIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
} | null>(null);

export interface TreeViewItemProps extends React.PropsWithChildren {
  icon?: React.ReactNode;
  expandIcon?: React.ReactNode;
  collapseIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  label: React.ReactNode;
  defaultExpanded?: boolean;
}

function TreeViewItem({
  icon: itemIcon,
  expandIcon: itemExpandIcon,
  collapseIcon: itemCollapseIcon,
  endIcon: itemEndIcon,
  label,
  defaultExpanded,
  children,
}: TreeViewItemProps) {
  const [expanded, setExpanded] = useState(defaultExpanded ?? false);
  const config = useContext(ConfigContext);
  const icon = itemIcon ?? config?.icon;
  const expandIcon = itemExpandIcon ?? config?.expandIcon;
  const collapseIcon = itemCollapseIcon ?? config?.collapseIcon;
  const endIcon = itemEndIcon ?? config?.endIcon;
  return children ? (
    <Collapsible.Root open={expanded} onOpenChange={setExpanded}>
      <Collapsible.Trigger className='flex items-center w-full h-8 p-1.5 text-sm truncate rounded-md hover:bg-gray-600/10 dark:hover:bg-gray-400/10'>
        <div className='w-5 flex justify-center items-center'>{expanded ? expandIcon : collapseIcon}</div>
        {icon && <div className='mr-1'>{icon}</div>}
        <div className='truncate'>{label}</div>
        {endIcon && <div className='ml-auto'>{endIcon}</div>}
      </Collapsible.Trigger>
      <Collapsible.Content className={twMerge(
        'ml-3',
        styles.collapsibleContent
        // 'transition-[height] data-[state=closed]:h-0 h-[var(--radix-collapsible-content-height)]'
      )}>
        {children}
      </Collapsible.Content>
    </Collapsible.Root>
  ) : (
    <div className='flex items-center h-8 p-1.5 pl-[1.625rem] cursor-pointer text-sm truncate rounded-md hover:bg-gray-600/10 dark:hover:bg-gray-400/10' tabIndex={0}>
      {icon && <div className='mr-1'>{icon}</div>}
      <div className='truncate'>{label}</div>
      {endIcon && <div className='ml-auto'>{endIcon}</div>}
    </div>
  )
}


export interface TreeViewProps extends React.PropsWithChildren<React.ComponentPropsWithoutRef<'div'>> {
  icon?: React.ReactNode;
  expandIcon?: React.ReactNode;
  collapseIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

function TreeView({
  icon,
  expandIcon = <IconChevronDown width={14} height={14} />,
  collapseIcon = <IconChevronRight width={14} height={14} />,
  endIcon,
  children,
  ...rest
}: TreeViewProps) {
  const config = {
    icon,
    expandIcon,
    collapseIcon,
    endIcon,
  }
  return (
    <ConfigContext.Provider value={config}>
      <div {...rest}>
        {children}
      </div>
    </ConfigContext.Provider>
  )
}

export default Object.assign(TreeView, { 
  Item: TreeViewItem,
});








