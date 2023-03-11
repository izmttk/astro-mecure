import { useSpring, animated } from '@react-spring/web';
import React, { useEffect, useRef, useState } from 'react'
import { twMerge } from 'tailwind-merge';
import IconCalendarFill from '~icons/mingcute/calendar-fill';
import IconTextFill from '~icons/mingcute/text-fill';
import IconTimeFill from '~icons/mingcute/time-fill';
import IconDocument from '~icons/mingcute/document-fill';
import IconEdit from '~icons/mingcute/edit-fill';
import IconUser from '~icons/mingcute/user-3-fill';

import Logo from './Logo'
import type { Page, Post } from '@/types';
import Category from '@/components/Category';
import Tag from '@/components/Tag';
interface HeroPostInfo {
  type: 'post',
  date: Post['date'],
  updateDate: Post['updateDate'],
  draft: Post['draft'],
  category: Post['category'],
  tags: Post['tags'],
  author: Post['author'],
  readingTime: Post['readingTime'],
  wordCount: Post['wordCount'],
}

interface HeroCategoriesInfo {
  type: 'categories',
  count: number,
}

interface HeroTagsInfo {
  type: 'tags',
  count: number,
}

interface HeroPostsInfo {
  type: 'posts',
  count: number,
}

interface HeroArchiveInfo {
  type: 'archive',
  count: number,
}

type HeroInfo = HeroPostInfo | HeroCategoriesInfo | HeroTagsInfo | HeroPostsInfo | HeroArchiveInfo;


export interface HeroConfig {
  bg: string;
  title?: string;
  description?: string;
  info?: HeroInfo,
}

export interface HeroProps extends React.PropsWithChildren<React.ComponentPropsWithoutRef<'div'>> {
  config: HeroConfig;
}

const calc = (x: number, y: number, rect: DOMRect) => {
  const scale = 1.15;
  return [
    -1 * (x - rect.left - rect.width / 2) * (scale - 1),
    -1 * (y - rect.top - rect.height / 2) * (scale - 1),
    scale,
  ]
}

const trans = (x: number, y: number, s: number) =>
  `translateX(${x}px) translateY(${y}px) scale(${s})`


export default function Hero({
  config,
  className,
  ...rest
}: HeroProps) {
  const {
    bg,
    title,
    description,
    info
  } = config;
  const ref = useRef<HTMLDivElement>(null);
  const [{ xys }, api] = useSpring(() => ({ 
    xys: [0, 0, 1], 
    config: {
      mass: 1,
      tension: 170,
      friction: 26,
    } 
  }));

  const handleMouseLeave = () =>
    api.start({
      xys: [0, 0, 1],
    })
  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = ref.current?.getBoundingClientRect();
    rect && api.start({
      xys: calc(e.clientX, e.clientY, rect),
    })
  }
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  });
  return (
    <header className={twMerge(
      className
    )} {...rest}>
      <div 
        className='w-full h-full overflow-hidden rounded-xl relative plate-bg plate-shadow border-highlight'
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
        ref={ref}
      >
        <animated.div 
          className='w-full h-full'
          style={{ transform: xys.to(trans) }}
        >
          <img className='w-full h-full object-cover pointer-events-none select-none' src={bg} alt='background' />
        </animated.div>
        <div className='absolute inset-0 p-4 md:p-8 flex flex-col justify-center items-center text-white drop-shadow-[0px_2px_3px_rgb(31,41,55,.5)]'>
          {title ? <h1 className='w-full text-2xl md:text-4xl font-bold text-center break-words'>{title}</h1> : <Logo className='h-24 md:h-28' />}
          {!info && description && <div className='mt-4'>{description}</div>}
          {info?.type === 'post' && (
            <>
              <div className='flex flex-wrap justify-center text-sm gap-x-4 gap-y-1 mt-4'>
                {/* make sure that prerendered html isn't afftected by timezone */}
                {info.date && <div className='flex items-center'>
                  <IconCalendarFill className='inline mr-1' />发布于{isMounted ? info.date.toLocaleDateString() : info.date.toLocaleDateString('zh-CN', {timeZone: 'Asia/Shanghai'})}
                </div>}
                {info.updateDate && <div className='flex items-center'>
                  <IconEdit className='inline mr-1' />修改于{isMounted ? info.updateDate.toLocaleDateString() : info.updateDate.toLocaleDateString('zh-CN', {timeZone: 'Asia/Shanghai'})}
                </div>}
                {info.readingTime && <div className='flex items-center'>
                  <IconTimeFill className='inline mr-1' />约{info.readingTime}分钟
                </div>}
                {info.wordCount && <div className='flex items-center'>
                  <IconTextFill className='inline mr-1' />共{info.wordCount}字
                </div>}
                {info.author && <div className='flex items-center'>
                  <IconUser className='inline mr-1' />{info.author}
                </div>}
                {info.draft && <div className='flex items-center'>
                  <IconDocument />草稿
                </div>}
              </div>
              <div className="flex flex-wrap items-center justify-center mt-4 gap-2">
                <Category onlyText className='text-white text-[0.8125rem] rounded-md px-1 py-0.5 bg-gray-900/40 ring-1 ring-white/30 hover:bg-white hover:text-black dark:hover:text-black transition-colors duration-75' category={info.category} />
                {info.tags.map(tag => <Tag onlyText className='text-white text-[0.8125rem] rounded-md px-1 py-px bg-gray-900/40 ring-1 ring-white/30 hover:bg-white hover:text-black dark:hover:text-black transition-colors duration-75' tag={tag} key={tag.label} />)}
              </div>
            </>
          )}
          {info?.type === 'categories' && (
            <div className='flex flex-wrap justify-center text-sm gap-x-4 gap-y-1 mt-4'>
              <div className=''>共{info.count}个分类</div>
            </div>
          )}
          {info?.type === 'tags' && (
            <div className='flex flex-wrap justify-center text-sm gap-x-4 gap-y-1 mt-4'>
              <div className=''>共{info.count}个标签</div>
            </div>
          )}
          {info?.type === 'posts' && (
            <div className='flex flex-wrap justify-center text-sm gap-x-4 gap-y-1 mt-4'>
              <div className=''>共{info.count}篇文章</div>
            </div>
          )}
          {info?.type === 'archive' && (
            <div className='flex flex-wrap justify-center text-sm gap-x-4 gap-y-1 mt-4'>
              <div className=''>共{info.count}篇文章</div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
