import IconCalendarFill from '~icons/mingcute/calendar-fill';
import IconEdit from '~icons/mingcute/edit-fill';

import DateTime from '@/components/DateTime';
import Tooltip from "@/components/Tooltip";
export interface PostMetaProps extends React.ComponentPropsWithoutRef<'div'> {
  date: Date;
  updateDate: Date;
}
export default function PostMeta({
  date,
  updateDate,
  ...rest
}: PostMetaProps) {
  return (
    /* make sure that prerendered html isn't afftected by timezone */
    date && <Tooltip content={
      <div>
        {date && <div><IconCalendarFill className='inline mr-1' />发布于：<DateTime date={date} /></div>}
        {updateDate && <div><IconEdit className='inline mr-1' />修改于：<DateTime date={updateDate} /></div>}
      </div>
    }>
      <div {...rest}>
        <IconCalendarFill className='inline mr-1' /><DateTime date={date} />
      </div>
    </Tooltip>
  )
}
