import type { Author, Category as CategoryType, Tag as TagType } from "@/types";
import IconCalendarFill from '~icons/mingcute/calendar-fill';
import IconTextFill from '~icons/mingcute/text-fill';
import IconTimeFill from '~icons/mingcute/time-fill';
import IconDocument from '~icons/mingcute/document-fill';
import IconEdit from '~icons/mingcute/edit-fill';
import IconUser from '~icons/mingcute/user-3-fill';
import Category from '@/components/Category';
import Tag from '@/components/Tag';
import DateTime from '@/components/DateTime';
import Tooltip from "@/components/Tooltip";
export interface PostMetaProps {
  date: Date;
  updateDate: Date;
  draft: boolean;
  author: Author;
  wordCount?: number;
  readingTime?: number;
  category: CategoryType;
  tags: TagType[];
}
export default function PostMeta({
  date,
  updateDate,
  draft,
  author,
  wordCount,
  readingTime,
  category,
  tags
}: PostMetaProps) {
  return (
    <>
      <div className='flex flex-wrap justify-center text-[0.8125rem] gap-2 mt-4 pointer-events-auto'>
        {/* make sure that prerendered html isn't afftected by timezone */}
        {date && <Tooltip content={
          <div>
            {date && <div>发布于：<DateTime date={date} /></div>}
            {updateDate && <div>修改于：<DateTime date={updateDate} /></div>}
          </div>
        }>
          <div className='flex items-center bg-black/50 rounded-full text-xs px-2 py-[0.1875rem] shadow-md'>
            <IconCalendarFill className='inline mr-1' /><DateTime date={date} />
          </div>
        </Tooltip>}
        {readingTime && <div className='flex items-center bg-black/50 rounded-full text-xs px-2 py-[0.1875rem] shadow-md'>
          <IconTimeFill className='inline mr-1' />约{readingTime}分钟
        </div>}
        {wordCount && <div className='flex items-center bg-black/50 rounded-full text-xs px-2 py-[0.1875rem] shadow-md'>
          <IconTextFill className='inline mr-1' />共{wordCount}字
        </div>}
        {author && <div className='flex items-center bg-black/50 rounded-full text-xs px-2 py-[0.1875rem] shadow-md'>
          <IconUser className='inline mr-1' />{author.name}
        </div>}
        {draft && <div className='flex items-center bg-black/50 rounded-full text-xs px-2 py-[0.1875rem] shadow-md'>
          <IconDocument />草稿
        </div>}
      </div>
      <div className='flex flex-wrap items-center justify-center mt-2 md:mt-4 gap-2 pointer-events-auto'>
        <Category className='bg-black/50 rounded-full text-xs px-2 py-[0.1875rem] shadow-md hover:bg-white hover:text-black' onlyText category={category} />
        {tags.map(tag => <Tag className='bg-black/50 rounded-full text-xs px-2 py-[0.1875rem] shadow-md hover:bg-white hover:text-black' onlyText tag={tag} key={tag.slug} />)}
      </div>
    </>
  )
}
