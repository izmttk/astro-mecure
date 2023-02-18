import React, { useRef, useState } from 'react'
export default function Example({
  children
}: React.PropsWithChildren) {
  const [state, setState] = useState(0);
  const handleClick = () => {
    setState(value => value + 1);
  }
  return (
    <div onClick={handleClick}>
      render Id: {state > 0 ? crypto.randomUUID() : 'initial render'} <br />
      Click me to render! <br />
      {children}
    </div>
  )
}
