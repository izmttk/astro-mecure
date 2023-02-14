import type React from 'react'
import { twMerge } from 'tailwind-merge';
import Timeline from '@/components/Timeline';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface ArchivePostBrief {
  title: string;
  image?: string;
  date: Date;
  description?: string;
  url: string;
}

interface ArchiveTimeline extends Array<{
  label: string;
  posts: ArchivePostBrief[];
}>{}

export interface ArchiveConfig {
  title?: string;
  timeline: ArchiveTimeline;
}

type PostBriefProps = Omit<
  React.PropsWithChildren<React.ComponentPropsWithoutRef<'div'>>,
  keyof ArchivePostBrief
> & ArchivePostBrief;

function PostBrief({
  title,
  image,
  date,
  description,
  url,
  className,
  ...rest
}: PostBriefProps) {
  return (
    <div className={twMerge(
      'overflow-hidden rounded-xl py-3 pl-4 pr-3 relative plate-bg plate-shadow border-highlight',
      image && 'text-white',
      className
    )} {...rest}>
      <div className={twMerge(
        'absolute top-0 left-0 blur-xl brightness-[.8] saturate-[1.35]',
        'w-[calc(100%_+_64px)] h-[calc(100%_+_64px)] ml-[-32px] mt-[-32px]',
        'select-none pointer-events-none',
      )} style={{
        background: image ? `url(${image}) center/cover` : undefined
      }}></div>
      <a href={url} className={twMerge(
        'block text-lg font-bold truncate mb-1 relative',
      )}>{title}</a>
      <div className='flex relative'>
        <div className='flex-1 min-w-0'>
          <div className={twMerge(
            'text-xs mb-1',
            image && 'text-white/80',
          )}>{format(date, 'PPP', { locale: zhCN })}</div>
          <div className='text-xs line-clamp-2'>{description}</div>
        </div>
        {image && <img src={image} className='flex-none w-14 h-14 object-cover rounded-lg ml-2 shadow-lg' alt='cover' />}
      </div>
    </div>
  )
}


export interface ArchiveProps extends React.PropsWithChildren<React.ComponentPropsWithoutRef<'section'>> {
  config: ArchiveConfig;
}

export default function Archive({
  config,
  className,
  ...rest
}: ArchiveProps) {
  const {
    title,
    timeline,
  } = config;
  return (
    <section className={twMerge(
      className,
    )} {...rest}>
      <h2 className='text-xl font-bold'>{title}</h2>
      <Timeline>
        {timeline.map((item, index) => (
          <Timeline.Item label={item.label} key={index}>
            <div className='flex flex-wrap gap-3'>
              {item.posts.map((post, index) => (
                <PostBrief {...post} className='w-full md:w-[17rem] flex-none' key={index} />
              ))}
            </div>
          </Timeline.Item>
        ))}
      </Timeline>
    </section>
  )
}
