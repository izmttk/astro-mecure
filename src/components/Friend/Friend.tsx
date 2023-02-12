import type React from 'react';
import type { HTMLAttributes } from 'react'
import { twMerge } from 'tailwind-merge'

export interface FriendProps extends HTMLAttributes<HTMLElement> {
  avatar: string;
  name: string;
  description: string;
  url: string;
  bgColor?: string;
  textColor?: string;
}

export default function Friend({
  className,
  avatar,
  name,
  description,
  url,
  bgColor,
  textColor,
  ...rest
}: FriendProps) {
  return (
    <a className={twMerge(
      'flex p-2 rounded-xl bg-gray-200 dark:bg-gray-700',
      className
    )} href={url} target='_blank' {...rest} style={{
      backgroundColor: bgColor,
      color: textColor
    }}>
      <img src={avatar} className='w-[4.25rem] h-[4.25rem] object-cover rounded-lg flex-none mr-2' alt={name} />
      <div className='flex-1 min-w-0 flex flex-col justify-center'>
        <div className='truncate text-lg font-bold'>{name}</div>
        <div className='line-clamp-2 text-sm'>{description}</div>
      </div>
    </a>
  )
}
