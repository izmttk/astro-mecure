import React from 'react'
import type { GiscusOptions } from '../components/comment/Giscus';
import type { WalineOptions } from '../components/comment/Waline';

export interface GiscusCommentConfig {
  vender: 'giscus';
  options: GiscusOptions;
}

export interface WalineCommentConfig {
  vender: 'waline';
  options: WalineOptions;
}

export type CommentConfig = GiscusCommentConfig | WalineCommentConfig | false;

export interface CommentProps {
  config: CommentConfig;
}

const Giscus = React.lazy(() => import('../components/comment/Giscus'));
const Waline = React.lazy(() => import('../components/comment/Waline'));

export default function Comment({
  config
}: CommentProps) {
  if (!config) {
    return null;
  }
  if (config.vender === 'giscus') {
    return <Giscus {...config.options} />;
  } else if (config.vender === 'waline') {
    return <Waline {...config.options} />;
  }
  return null;
}
