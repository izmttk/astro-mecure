import type { CSSProperties, ComponentPropsWithoutRef } from 'react';
import { twMerge } from 'tailwind-merge';

import styles from './ProgressBar.module.css';

export interface ProgressBarComponentProps
  extends Omit<ComponentPropsWithoutRef<'div'>, 'children'> {
  progress: number;
  visible: boolean;
  complete?: boolean;
}

type ProgressStyle = CSSProperties & {
  '--progress-value': string;
};

export default function ProgressBarComponent({
  progress,
  visible,
  complete = false,
  className,
  style,
  ...rest
}: ProgressBarComponentProps) {
  const normalizedProgress = Math.min(100, Math.max(0, progress));
  const progressStyle = {
    ...style,
    '--progress-value': `${normalizedProgress}%`,
  } as ProgressStyle;

  return (
    <div
      {...rest}
      className={twMerge(styles.root, className)}
      style={progressStyle}
      data-visible={visible}
      data-complete={complete}
      role="progressbar"
      aria-hidden={!visible}
      aria-label="页面加载进度"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(normalizedProgress)}
      aria-valuetext={complete ? '页面加载完成' : '正在加载页面'}
    >
      <span className={styles.rail} aria-hidden="true" />
      <span className={styles.bar} aria-hidden="true" />
    </div>
  );
}
