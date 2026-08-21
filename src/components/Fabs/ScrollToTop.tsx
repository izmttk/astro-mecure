import IconChevronUp from '~icons/tabler/chevron-up';
import { useEffect, useId, useRef } from 'react';

import styles from './Fabs.module.css';

const FOOTER_SELECTOR = '[data-site-footer]';

export default function ScrollToTop() {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const progressGlowRef = useRef<SVGCircleElement>(null);
  const progressRef = useRef<SVGCircleElement>(null);
  const gradientId = `fab-progress-${useId().replace(/:/g, '')}`;

  useEffect(() => {
    const button = buttonRef.current;
    const progressGlow = progressGlowRef.current;
    const progressCircle = progressRef.current;
    const dock = button?.closest<HTMLElement>('[data-fabs]');
    if (!button || !progressGlow || !progressCircle || !dock) return;

    let animationFrame = 0;
    const footer = document.querySelector<HTMLElement>(FOOTER_SELECTOR);
    const dockStyles = getComputedStyle(dock);
    const baseBottom = Number.parseFloat(dockStyles.bottom) || 0;
    const footerGap = Number.parseFloat(dockStyles.getPropertyValue('--fab-footer-gap')) || 0;

    const update = () => {
      animationFrame = 0;

      const root = document.documentElement;
      const maximumScroll = Math.max(1, root.scrollHeight - root.clientHeight);
      const progress = Math.min(1, Math.max(0, window.scrollY / maximumScroll));
      const progressOffset = String(1 - progress);
      progressGlow.style.strokeDashoffset = progressOffset;
      progressCircle.style.strokeDashoffset = progressOffset;
      button.toggleAttribute('data-scrolled', progress > 0.001);

      const fixedBottomEdge = window.innerHeight - baseBottom;
      const footerTop = footer?.getBoundingClientRect().top ?? Number.POSITIVE_INFINITY;
      const lift = Math.max(0, fixedBottomEdge + footerGap - footerTop);

      dock.style.setProperty('--fab-footer-lift', `${lift}px`);
      dock.toggleAttribute('data-docked', lift > 0.5);
    };

    const scheduleUpdate = () => {
      if (animationFrame) return;
      animationFrame = window.requestAnimationFrame(update);
    };

    const resizeObserver = new ResizeObserver(scheduleUpdate);
    resizeObserver.observe(document.body);
    if (footer) resizeObserver.observe(footer);

    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate);
    scheduleUpdate();

    return () => {
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
    };
  }, []);

  const scrollToTop = () => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  };

  return (
    <button
      ref={buttonRef}
      type="button"
      className={styles.button}
      onClick={scrollToTop}
      aria-label="返回页面顶部"
    >
      <svg
        className={styles.progressRing}
        viewBox="0 0 44 44"
        fill="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={gradientId} x1="7" y1="4" x2="38" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#67e8f9" />
            <stop offset="0.52" stopColor="#60a5fa" />
            <stop offset="1" stopColor="#c084fc" />
          </linearGradient>
        </defs>
        <circle
          ref={progressGlowRef}
          className={styles.progressGlow}
          cx="22"
          cy="22"
          r="17.5"
          pathLength="1"
          stroke={`url(#${gradientId})`}
        />
        <circle
          ref={progressRef}
          className={styles.progressValue}
          cx="22"
          cy="22"
          r="17.5"
          pathLength="1"
          stroke={`url(#${gradientId})`}
        />
      </svg>
      <IconChevronUp className={styles.icon} aria-hidden="true" />
    </button>
  );
}
