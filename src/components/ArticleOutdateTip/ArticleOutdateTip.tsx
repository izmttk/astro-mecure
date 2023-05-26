import type React from 'react';
import { formatDistanceToNow, isAfter, subMonths } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import IconInformationFill from '~icons/mingcute/information-fill';
import { twMerge } from 'tailwind-merge';

export interface ArticleOutdateTipProps extends React.ComponentPropsWithoutRef<'div'> {
  updateDate: Date
}

export default function ArticleOutdateTip({
  updateDate,
  className,
  ...rest
}: ArticleOutdateTipProps) {
  const distance = formatDistanceToNow(updateDate, {
    addSuffix: true,
    locale: zhCN
  });
  return (
    isAfter(
      updateDate,
      subMonths(Date.now(), 3)
    ) ? null :
    <div className={twMerge(
      'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 p-3',
      className
    )} {...rest}>
      <IconInformationFill className='w-5 h-5 inline align-middle mr-2' />
      <p className='inline align-middle'>本文最后一次更新于 {distance}，文中内容可能已经过时，请注意甄别。</p>
    </div>
  )
}
