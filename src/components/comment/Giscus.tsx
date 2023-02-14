import GiscusComponent from '@giscus/react';
import type { GiscusProps as GiscusComponentProps } from '@giscus/react';
import useTheme from '@/hooks/useTheme';


export interface GiscusOptions extends Omit<GiscusComponentProps, 'id'> {}

export default function Giscus(props: GiscusOptions) {
  const { colorMode } = useTheme();

  return (
    <GiscusComponent
      id="comments"
      theme={colorMode === 'dark' ? 'dark_dimmed' : 'light'}
      {...props}
    />
  )
}
