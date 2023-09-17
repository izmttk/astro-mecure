import { twMerge } from 'tailwind-merge';
import TagChip from '../Tag';
import IconTag from '~icons/tabler/tag';

export interface TagCloudProps {
  tags: {
    label: string;
    url: string;
  }[];
}
export default function TagCloud({
  tags
}: TagCloudProps) {
  return (
    <div>
      <h2 className='font-bold text-lg flex items-center p-2'><IconTag className='w-5 h-5 mr-1' />标签云</h2>
      <div className='flex flex-wrap gap-1.5 '>
        {tags.map(tag => (
          <TagChip
            tag={tag}
            onlyText
            className={twMerge(
              'plate-bg plate-shadow border-highlight rounded-md duration-75 leading-4',
              'hover:bg-primary-500 hover:text-white',
            )}
            key={tag.label}
          />
        ))}
      </div>
    </div>

  )
}
