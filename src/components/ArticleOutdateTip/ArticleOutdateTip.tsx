import { formatDistanceToNow, isAfter, subDays } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import IconInformationFill from '~icons/mingcute/information-fill';
import { twMerge } from 'tailwind-merge';

export interface ArticleOutdateTipProps extends React.ComponentPropsWithoutRef<'div'> {
  updateDate: Date,
  outdateLimit?: number,
}

export default function ArticleOutdateTip({
  updateDate,
  outdateLimit = 30,
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
      subDays(Date.now(), outdateLimit)
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
