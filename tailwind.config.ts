// tailwind.config.ts
import type { Config } from 'tailwindcss'
import type { PluginUtils } from 'tailwindcss/types/config'

import tailwindScrollbar from 'tailwind-scrollbar'
import typography from '@tailwindcss/typography'
// import clipPath from 'tailwind-clip-path'

import plugin from 'tailwindcss/plugin'
import colors from 'tailwindcss/colors'
import defaultTheme from 'tailwindcss/defaultTheme'
const gray = colors.gray;
const primary = colors.blue;
const secondary = colors.pink;

const round = (num: number) =>
  num
    .toFixed(7)
    .replace(/(\.[0-9]+?)0+$/, '$1')
    .replace(/\.0$/, '')
const rem = (px: number) => `${round(px / 16)}rem`
const em = (px: number, base: number) => `${round(px / base)}em`

export default {
	content: [
    './src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}',
    './plugins/**/*.{js,ts}',
  ],
  darkMode: 'class',
  theme: {
    fontFamily:{
      sans: ['Inter Variable', 'Inter',  ...defaultTheme.fontFamily.sans],
      mono: ['Fira Code Variable', 'Fira Code', ...defaultTheme.fontFamily.mono],
    },
    extend: {
      colors: {
        gray: gray,
        primary: primary,
        secondary: secondary,
        background: {
          DEFAULT: '#f5f5fa',
          light: '#f5f5fa',
          dark: gray[900],
        },
        text: {
          primary: {
            DEFAULT: gray[900],
            light: gray[900],
            dark: gray[300],
          },
          secondary: {
            DEFAULT: gray[600],
            light: gray[600],
            dark: gray[400],
          },
          disabled: {
            DEFAULT: gray[400],
            light: gray[400],
            dark: gray[600],
          }
        },
        plate: {
          DEFAULT: colors.white,
          light: colors.white,
          dark: gray[800],
        }
      },
      typography: ({ theme }: PluginUtils) => ({
        DEFAULT: {
          css: {
            maxWidth: 'none',
            overflowWrap: 'break-word',
            lineHeight: 1.6,
            fontSize: '0.9375rem',
            '--tw-prose-body': colors.gray[700],
            '--tw-prose-headings': colors.gray[800],
            '--tw-prose-lead': colors.gray[600],
            '--tw-prose-links': colors.gray[900],
            '--tw-prose-bold': colors.gray[900],
            '--tw-prose-hr': colors.gray[300],
            '--tw-prose-quotes': colors.gray[800],
            '--tw-prose-code': colors.gray[900],
            '--tw-prose-pre-code': colors.gray[300],
            '--tw-prose-pre-bg': colors.gray[800],

            '--tw-prose-invert-body': colors.gray[400],
            '--tw-prose-invert-headings': colors.gray[300],
            '--tw-prose-invert-lead': colors.gray[500],
            '--tw-prose-invert-links': colors.gray[200],
            '--tw-prose-invert-bold': colors.gray[200],
            '--tw-prose-invert-hr': colors.gray[600],
            '--tw-prose-invert-quotes': colors.gray[300],
            '--tw-prose-invert-code': colors.gray[200],
            '--tw-prose-invert-pre-code': colors.gray[300],
            '--tw-prose-invert-pre-bg': colors.gray[900],
            hr: {
              marginTop: '1.5em',
              marginBottom: '1.5em',
            },
            a: {
              fontWeight: 'bold',
              textDecoration: 'none',
              boxShadow: `inset 0 -0.12em 0 ${theme('colors.primary.400')}`,
              transition: 'box-shadow .2s ease-in-out,color .2s ease-in-out',
            },
            'a:hover': {
              boxShadow: `inset 0 -1.5em 0 ${theme('colors.primary.400/50%')}`,
            },
            'a code': {
              color: 'inherit',
              fontWeight: 'inherit',
            },
            img: {
              borderRadius: theme('borderRadius.lg'),
              marginLeft: 'auto',
              marginRight: 'auto',
            },
            table: {
              // display: 'block',
              width: 'fit-content',
              overflowX: 'auto',
              marginLeft: 'auto',
              marginRight: 'auto',
            },
            kbd: {
              background: theme('colors.gray.100'),
              borderWidth: '1px',
              borderColor: theme('colors.gray.200'),
              padding: '0.125em 0.25em',
              color: theme('colors.gray.700'),
              fontWeight: 500,
              fontSize: '0.75em',
              fontVariantLigatures: 'none',
              borderRadius: '4px',
              margin: '0 1px',
            },
            code: {
              fontVariantLigatures: 'none',
            },
            pre: {
              borderRadius: theme('borderRadius.xl'),
              padding: theme('padding.5'),
              boxShadow: theme('boxShadow.md'),
            },
            'figure figcaption': {
              textAlign: 'center',
            },
            'ol, ul, li': {
              margin: 0,
            },
            'ul ul, ul ol, ol ul, ol ol': {
              margin: 0,
            },
            'ul li > *:first-child, ol li > *:first-child': {
              marginTop: 0,
            },
            'ul li > *:last-child, ol li > *:last-child': {
              marginBottom: 0,
            },
          },
        },
        compact: {
          css: [
            {
              p: {
                marginTop: em(8, 14),
                marginBottom: em(8, 14),
              },
              '[class~="lead"]': {
                marginTop: em(16, 18),
                marginBottom: em(16, 18),
              },
              blockquote: {
                marginTop: em(24, 18),
                marginBottom: em(24, 18),
                paddingLeft: em(20, 18),
              },
              h1: {
                marginTop: '0',
                marginBottom: em(24, 30),
              },
              h2: {
                marginTop: em(32, 20),
                marginBottom: em(16, 20),
              },
              h3: {
                marginTop: em(28, 18),
                marginBottom: em(8, 18),
              },
              h4: {
                marginTop: em(20, 14),
                marginBottom: em(8, 14),
              },
              img: {
                marginTop: em(24, 14),
                marginBottom: em(24, 14),
              },
              video: {
                marginTop: em(24, 14),
                marginBottom: em(24, 14),
              },
              figure: {
                marginTop: em(24, 14),
                marginBottom: em(24, 14),
              },
              'figure > *': {
                marginTop: '0',
                marginBottom: '0',
              },
              figcaption: {
                marginTop: em(8, 12),
              },
              pre: {
                marginTop: em(16, 12),
                marginBottom: em(16, 12),
                borderRadius: rem(8),
                paddingTop: em(8, 12),
                paddingRight: em(12, 12),
                paddingBottom: em(8, 12),
                paddingLeft: em(12, 12),
              },
              ol: {
                marginTop: em(16, 14),
                marginBottom: em(16, 14),
                paddingLeft: em(22, 14),
              },
              ul: {
                marginTop: em(8, 14),
                marginBottom: em(8, 14),
                paddingLeft: em(22, 14),
              },
              li: {
                marginTop: em(4, 14),
                marginBottom: em(4, 14),
              },
              'ol > li': {
                paddingLeft: em(6, 14),
              },
              'ul > li': {
                paddingLeft: em(6, 14),
              },
              '> ul > li p': {
                marginTop: em(8, 14),
                marginBottom: em(8, 14),
              },
              '> ul > li > *:first-child': {
                marginTop: em(16, 14),
              },
              '> ul > li > *:last-child': {
                marginBottom: em(16, 14),
              },
              '> ol > li > *:first-child': {
                marginTop: em(16, 14),
              },
              '> ol > li > *:last-child': {
                marginBottom: em(16, 14),
              },
              'ul ul, ul ol, ol ul, ol ol': {
                marginTop: em(8, 14),
                marginBottom: em(8, 14),
              },
              hr: {
                marginTop: em(40, 14),
                marginBottom: em(40, 14),
              },
              'hr + *': {
                marginTop: '0',
              },
              'h2 + *': {
                marginTop: '0',
              },
              'h3 + *': {
                marginTop: '0',
              },
              'h4 + *': {
                marginTop: '0',
              },
            },
            {
              '> :first-child': {
                marginTop: '0',
              },
              '> :last-child': {
                marginBottom: '0',
              },
            },
          ],
        },
        dark: {
          css: {
            kbd: {
              background: theme('colors.gray.700'),
              borderColor: theme('colors.gray.600'),
              color: theme('colors.gray.200'),
            },
          },
        },
      }),
    },
  },
  plugins: [
    tailwindScrollbar({ nocompatible: true }),
    typography(),
    // add a "ring-highlight" utility
    // which sets a top border highlight using box-shadow
    // thus conflicting with any other ring utilities
    // shadow utilities are not affected
    plugin(({ addUtilities }) => {
      addUtilities({
        '.ring-highlight': {
          'box-shadow': [
            `inset 0 1px 0 0 var(--tw-ring-color)`,
            `var(--tw-shadow, 0 0 #0000)`,
          ].join(', ')
        }
      })
    }),
    plugin(({ addUtilities, theme }) => {
      addUtilities({
        '.plate-bg': {
          '@apply bg-plate-light dark:bg-plate-dark': {}
        },
        '.plate-shadow': {
          '@apply shadow-lg shadow-gray-900/10 dark:shadow-black/20': {}
        },
        '.border-highlight': {
          '@apply ring-1 ring-gray-600/10 dark:ring-highlight dark:ring-white/5': {}
        },
        '.text-primary': {
          '@apply text-text-primary-light dark:text-text-primary-dark': {}
        },
        '.text-secondary': {
          '@apply text-text-secondary-light dark:text-text-secondary-dark': {}
        },
        '.text-disabled': {
          '@apply text-text-disabled-light dark:text-text-disabled-dark': {}
        },
        '.pressable': {
          '@apply active:scale-90': {}
        }
      })
    })
  ],
} satisfies Config;
