import React from 'react';
import * as RadixTooltip from '@radix-ui/react-tooltip';
import styles from './Tooltip.module.css';
import { twMerge } from 'tailwind-merge';
export interface TooltipProps extends React.PropsWithChildren {
  content: React.ReactNode
}

export default function Tooltip({
  content,
  children
}: TooltipProps) {
  return (
    <RadixTooltip.Provider>
      <RadixTooltip.Root delayDuration={200}>
        <RadixTooltip.Trigger asChild>
          {children}
        </RadixTooltip.Trigger>
        <RadixTooltip.Portal>
          <RadixTooltip.Content className={twMerge(
            styles.tooltipContent,
            'rounded-md plate-bg plate-shadow border-highlight text-xs px-2.5 py-1.5'
          )} side='bottom' sideOffset={5}>
            {content}
            <RadixTooltip.Arrow className='fill-plate-light dark:fill-plate-dark' />
          </RadixTooltip.Content>
        </RadixTooltip.Portal>
      </RadixTooltip.Root>
    </RadixTooltip.Provider>
  )
}
