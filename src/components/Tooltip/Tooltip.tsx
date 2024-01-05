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
            'rounded-md bg-gray-700 text-xs text-white px-2.5 py-1.5'
          )} side='bottom' sideOffset={5}>
            {content}
            <RadixTooltip.Arrow className='fill-gray-700' />
          </RadixTooltip.Content>
        </RadixTooltip.Portal>
      </RadixTooltip.Root>
    </RadixTooltip.Provider>
  )
}
