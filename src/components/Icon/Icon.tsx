// import { Suspense, type SVGProps } from 'react'
// import { pascalCase } from 'change-case'
import { Icon as Iconify, type IconProps as IconifyProps } from '@iconify/react';



// import avatarImg from '@/assets/avatar.png';
// import profileBg from '@/assets/profile-bg.webp'
// import IconBrandGithub from '~icons/tabler/brand-github'
// import IconBrandBilibili from '~icons/tabler/brand-bilibili'
// import IconBrandNeteaseMusic from '~icons/tabler/brand-netease-music'
// import IconBrandTwitter from '~icons/tabler/brand-twitter'
// import IconMail from '~icons/tabler/mail'


// const resolve = (name: string) => {
//   return React.lazy(async () => {
//     const resolved = await import('@tabler/icons-react');
//     return { default: resolved[name] };
//   })
// }

// export interface IconProps extends SVGProps<SVGSVGElement> {
export interface IconProps extends Omit<IconifyProps, 'icon'> {
    name: string;
}
export default function Icon({
  name,
  ...rest
}: IconProps) {
  // const info = stringToIcon(name);
  // if (!info) {
  //   return null;
  // }
  // const iconName = `${info.prefix}/${info.name}`;
  // const NamedIcon = resolve(`Icon${pascalCase(name)}`);
  return (
    <Iconify {...rest} icon={name} />
    // <Suspense fallback={null}>
    //   <NamedIcon {...rest} />
    // </Suspense>
  )
}
