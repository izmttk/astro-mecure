import React from 'react'
import type { GiscusOptions } from '@/components/comment/Giscus';
import type { WalineOptions } from '@/components/comment/Waline';

export interface GiscusCommentConfig {
  provider: 'giscus';
  options: GiscusOptions;
}

export interface WalineCommentConfig {
  provider: 'waline';
  options: WalineOptions;
}

export type CommentConfig = GiscusCommentConfig | WalineCommentConfig | false;

export interface CommentProps {
  config: CommentConfig;
}

const Giscus = React.lazy(() => import('@/components/comment/Giscus'));
const Waline = React.lazy(() => import('@/components/comment/Waline'));

export default function Comment({
  config
}: CommentProps) {
  if (!config) {
    return null;
  }
  if (config.provider === 'giscus') {
    return <Giscus {...config.options} />;
  } else if (config.provider === 'waline') {
    return <Waline {...config.options} />;
  }
  return null;
}
