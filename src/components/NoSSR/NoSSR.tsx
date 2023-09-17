import { useState } from 'react'
import { useMount } from 'react-use'

export interface NoSSRProps extends React.PropsWithChildren {}

export default function NoSSR({
  children
}: NoSSRProps) {
  const [isMounted, setIsMounted] = useState(false);
  useMount(() => {
    setIsMounted(true);
  })
  return (
    <>{isMounted ? children : null}</>
  )
}
