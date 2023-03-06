import { useWindowSize } from 'react-use';

function useBreakpoints(
  breakpoint: 'base' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
) {
  let minWidth = 0;
  switch(breakpoint) {
    case 'base':
      minWidth = 0;
      break;
    case 'sm':
      minWidth = 640;
      break;
    case 'md':
      minWidth = 768;
      break;
    case 'lg':
      minWidth = 1024;
      break;
    case 'xl':
      minWidth = 1280;
      break;
    case '2xl':
      minWidth = 1536;
      break;
    default:
      throw new Error(`${breakpoint} is not a valid breakpoint name.`);
  }
  const {width} = useWindowSize();
  return width >= minWidth;

}

export default useBreakpoints;