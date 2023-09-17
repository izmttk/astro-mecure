import type { SVGProps } from 'react';
import IconRss from '~icons/tabler/rss';
import IconSitemap from '~icons/tabler/sitemap';
import { twMerge } from 'tailwind-merge';
import { isUnderBaseUrl, url } from '@/utils/url';

const AstroLogo = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 78 102" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M55.07 14.216l16.81 54.865a72.6 72.6 0 00-20.765-6.984L39.808 24.135a1.475 1.475 0 00-2.827.005L25.81 62.078a72.598 72.598 0 00-20.859 6.995L21.847 14.2c.998-3.243 1.497-4.865 2.47-6.066a8 8 0 013.239-2.392c1.434-.576 3.13-.576 6.524-.576h8.751c3.398 0 5.097 0 6.532.577a8 8 0 013.241 2.397c.972 1.203 1.47 2.827 2.465 6.076z" clipRule="evenodd"></path>
    <path fill="#FF5D01" fillRule="evenodd" d="M54.618 71.779c-2.863 2.432-8.578 4.091-15.161 4.091-8.08 0-14.852-2.499-16.649-5.86-.642 1.926-.786 4.13-.786 5.539 0 0-.423 6.915 4.418 11.725 0-2.498 2.037-4.522 4.551-4.522 4.309 0 4.304 3.734 4.3 6.764v.27c0 4.6 2.829 8.541 6.852 10.203a9.22 9.22 0 01-.938-4.064c0-4.386 2.592-6.02 5.604-7.917 2.396-1.51 5.06-3.188 6.894-6.554a12.297 12.297 0 001.502-5.905c0-1.314-.206-2.581-.587-3.77z" clipRule="evenodd"></path>
  </svg>
)


export interface FooterConfig {
  links?: {
    label: string;
    url: string;
  }[];
  declarations?: React.ReactNode[];
  generator?: boolean;
  rss?: boolean;
  sitemap?: boolean;
}

export interface FooterProp extends React.PropsWithChildren<React.ComponentPropsWithoutRef<'div'>>{
  config: FooterConfig;
  containerClassName?: string;
}

export default function Footer({
  config,
  className,
  containerClassName,
  ...rest
}: FooterProp) {
  const {
    links,
    declarations,
    generator = true,
    rss = true,
    sitemap = true,
  } = config;

  return (
    <footer className={twMerge(
      'bg-gray-200 dark:bg-gray-800 flex border-t border-gray-200/30 dark:border-gray-700/30',
      className
    )}>
      <div {...rest} className={twMerge(
        'text-sm md:space-y-2 w-full',
        containerClassName
      )}>
        {/* Links */}
        {links && <div className='space-x-3'>
          {links.map((link, index) => (
            <a href={link.url} key={index} target={isUnderBaseUrl(link.url) ? '_self' : '_blank'}>{link.label}</a>
          ))}
        </div>}
        {/* Declarations */}
        {declarations && <div className='space-x-3'>
          {declarations.map((decl, index) => (
            <span key={index}>{decl}</span>
          ))}
        </div>}
        {/* Site Info */}
        <div className='flex flex-wrap gap-x-3'>
          {generator && <span>Powered By <a href='https://astro.build/' target='_blank'><AstroLogo className='inline' />Astro</a> · Designed By 银河渡舟.</span>}
          {rss && <a href={url('rss/feed.xml')} target='_blank' className='whitespace-nowrap'><IconRss className='inline align-[-3px] mr-1' />RSS订阅</a>}
          {sitemap && <a href={url('sitemap-index.xml')} target='_blank' className='whitespace-nowrap'><IconSitemap className='inline align-[-3px] mr-1' />站点地图</a>}
        </div>
      </div>
    </footer>

  )
}
