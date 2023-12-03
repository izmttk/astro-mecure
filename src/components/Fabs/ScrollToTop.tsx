export interface ScrollToTopProps {}
import IconChevronUp from '~icons/tabler/chevron-up';
import { useWindowScroll } from 'react-use';
import useSSR from '@/hooks/useSSR';
export default function ScrollToTop({
  ...rest
}: ScrollToTopProps) {
  const { isBrowser } = useSSR();
  const { y: scrollY } = useWindowScroll();
  // 应该监视页面长度
  const getDasharray = () => {
    const r = 11;
    const perimeter = Math.PI * 2 * r;
    const pageLength = isBrowser ? document.documentElement.scrollHeight - document.documentElement.clientHeight + 0.001 : Infinity;
    return scrollY / pageLength * perimeter + ' ' + perimeter;
  };
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  return (
    <button className="relative w-11 h-11 bg-white dark:bg-gray-700 plate-shadow border-highlight rounded-full flex items-center justify-center" onClick={scrollToTop}>
      <IconChevronUp className="w-6 h-6 z-10" />
      <svg className="w-full h-full absolute" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <linearGradient id="Gradient" gradientTransform="rotate(90)">
          <stop offset="0" stop-color="currentColor" stop-opacity="1" className="text-primary-500" />
          <stop offset="1" stop-color="currentColor" stop-opacity="1" className="text-secondary-500" />
        </linearGradient>
        <circle stroke="url(#Gradient)" cx="12" cy="12" r="11" fill="none" strokeWidth={scrollY === 0 ? 0 : 2} strokeLinecap="round" strokeDasharray={getDasharray()} transform="rotate(-90, 12, 12)" />
      </svg>
    </button>
  )
}
