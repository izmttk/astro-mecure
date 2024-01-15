import type { 
  Paragraph,
  Parent,
  Text,
  RootContent as MdastContent,
} from 'mdast';

import type { RootContent as HastContent } from 'hast';

import type {
  Handle,
  Extension as FromMarkdownExtension
} from 'mdast-util-from-markdown';


export interface Admonition extends Parent {
  type: 'admonition',
  name: string,
};

import styles from './styles.module.css';

import { twMerge } from 'tailwind-merge';
import { fromHtml } from 'hast-util-from-html';

export interface admonitionHTML extends Parent {
  type: 'admonitionHTML',
}

declare module 'mdast' {
  interface RootContentMap {
    admonitionHTML: admonitionHTML;
    admonition: Admonition;
  }
  interface ParagraphData {
    admonitionTitle?: boolean;
  }
}

const admonitionConfig: Record<string, {
  title: string,
  icon: string,
  class: string,
}> = {
  note: {
    title: '备注',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="1.2em" height="1.2em" viewBox="0 0 24 24" class="mr-2"><g fill="none" fill-rule="evenodd"><path d="M24 0v24H0V0h24ZM12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035c-.01-.004-.019-.001-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427c-.002-.01-.009-.017-.017-.018Zm.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093c.012.004.023 0 .029-.008l.004-.014l-.034-.614c-.003-.012-.01-.02-.02-.022Zm-.715.002a.023.023 0 0 0-.027.006l-.006.014l-.034.614c0 .012.007.02.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01l-.184-.092Z"/><path fill="currentColor" d="M20.131 3.16a3 3 0 0 0-4.242 0l-.707.708l4.95 4.95l.706-.707a3 3 0 0 0 0-4.243l-.707-.707Zm-1.414 7.072l-4.95-4.95l-9.09 9.091a1.5 1.5 0 0 0-.401.724l-1.029 4.455a1 1 0 0 0 1.2 1.2l4.456-1.028a1.5 1.5 0 0 0 .723-.401l9.091-9.091Z"/></g></svg>',
    class: styles.note
  },
  info: {
    title: '信息',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="1.2em" height="1.2em" viewBox="0 0 24 24" class="mr-2"><g fill="none"><path d="M24 0v24H0V0h24ZM12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035c-.01-.004-.019-.001-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427c-.002-.01-.009-.017-.017-.018Zm.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093c.012.004.023 0 .029-.008l.004-.014l-.034-.614c-.003-.012-.01-.02-.02-.022Zm-.715.002a.023.023 0 0 0-.027.006l-.006.014l-.034.614c0 .012.007.02.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01l-.184-.092Z"/><path fill="currentColor" d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12S6.477 2 12 2Zm-.01 8H11a1 1 0 0 0-.117 1.993L11 12v4.99c0 .52.394.95.9 1.004l.11.006h.49a1 1 0 0 0 .596-1.803L13 16.134V11.01c0-.52-.394-.95-.9-1.004L11.99 10ZM12 7a1 1 0 1 0 0 2a1 1 0 0 0 0-2Z"/></g></svg>',
    class: styles.info
  },
  tip: {
    title: '提示',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="1.2em" height="1.2em" viewBox="0 0 24 24" class="mr-2"><g fill="none"><path d="M24 0v24H0V0h24ZM12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035c-.01-.004-.019-.001-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427c-.002-.01-.009-.017-.017-.018Zm.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093c.012.004.023 0 .029-.008l.004-.014l-.034-.614c-.003-.012-.01-.02-.02-.022Zm-.715.002a.023.023 0 0 0-.027.006l-.006.014l-.034.614c0 .012.007.02.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01l-.184-.092Z"/><path fill="currentColor" d="M13 20a1 1 0 0 1 .117 1.993L13 22h-2a1 1 0 0 1-.117-1.993L11 20h2ZM12 2c4.41 0 8 3.543 8 7.933c0 3.006-1.522 5.196-2.78 6.494l-.284.283l-.27.252l-.252.22l-.33.27l-.328.244c-.241.17-.403.419-.55.678l-.205.364c-.238.41-.517.762-1.108.762h-3.786c-.59 0-.87-.351-1.108-.762l-.118-.208c-.172-.312-.348-.63-.637-.834l-.232-.171l-.199-.155l-.227-.188l-.252-.22l-.27-.252l-.285-.283C5.522 15.129 4 12.939 4 9.933C4 5.543 7.59 2 12 2Zm1.707 4.293a1 1 0 0 0-1.32-.083l-.094.083L10.3 8.286a1.01 1.01 0 0 0-.084 1.333l.084.095L11.586 11l-1.293 1.293a1 1 0 0 0 1.32 1.497l.094-.083l1.993-1.993a1.01 1.01 0 0 0 .084-1.333l-.084-.095L12.414 9l1.293-1.293a1 1 0 0 0 0-1.414Z"/></g></svg>',
    class: styles.tip
  },
  caution: {
    title: '注意',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="1.2em" height="1.2em" viewBox="0 0 24 24" class="mr-2"><g fill="none"><path d="M24 0v24H0V0h24ZM12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035c-.01-.004-.019-.001-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427c-.002-.01-.009-.017-.017-.018Zm.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093c.012.004.023 0 .029-.008l.004-.014l-.034-.614c-.003-.012-.01-.02-.02-.022Zm-.715.002a.023.023 0 0 0-.027.006l-.006.014l-.034.614c0 .012.007.02.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01l-.184-.092Z"/><path fill="currentColor" d="m13.299 3.148l8.634 14.954a1.5 1.5 0 0 1-1.299 2.25H3.366a1.5 1.5 0 0 1-1.299-2.25l8.634-14.954c.577-1 2.02-1 2.598 0ZM12 15a1 1 0 1 0 0 2a1 1 0 0 0 0-2Zm0-7a1 1 0 0 0-.993.883L11 9v4a1 1 0 0 0 1.993.117L13 13V9a1 1 0 0 0-1-1Z"/></g></svg>',
    class: styles.caution
  },
  danger: {
    title: '危险',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="1.2em" height="1.2em" viewBox="0 0 24 24" class="mr-2"><g fill="none"><path d="M24 0v24H0V0h24ZM12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035c-.01-.004-.019-.001-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427c-.002-.01-.009-.017-.017-.018Zm.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093c.012.004.023 0 .029-.008l.004-.014l-.034-.614c-.003-.012-.01-.02-.02-.022Zm-.715.002a.023.023 0 0 0-.027.006l-.006.014l-.034.614c0 .012.007.02.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01l-.184-.092Z"/><path fill="currentColor" d="m11.514 2.142l-1.26-.755l-.24 1.449C9.632 5.124 8.069 7.25 6.345 8.744C2.97 11.67 2.231 14.85 3.276 17.475c1 2.512 3.538 4.232 6.114 4.519l.596.066c-1.474-.901-2.42-3.006-2.09-4.579c.326-1.546 1.438-2.994 3.574-4.33l1.077-.672l.402 1.205c.237.712.647 1.284 1.064 1.865c.2.28.403.563.589.864c.643 1.045.813 2.207.398 3.36c-.378 1.048-1.002 1.872-1.86 2.329l.97-.108c2.418-.269 4.193-1.096 5.346-2.479C20.599 18.144 21 16.379 21 14.5c0-1.75-.719-3.554-1.567-5.055c-.994-1.758-2.291-3.218-3.707-4.633c-.245.49-.226.688-.73 1.475a8.146 8.146 0 0 0-3.482-4.145Z"/></g></svg>',
    class: styles.danger
  },
}

function h (
  tagName: string,
  properties: Record<string, any>,
  children?: (MdastContent | undefined | null | false)[],
): admonitionHTML {
  const filteredChildren = children?.filter<MdastContent>((child): child is MdastContent => {
    return child !== undefined && child !== null && child !== false;
  }) ?? [];
  return {
    type: 'admonitionHTML',
    data: {
      hName: tagName,
      hProperties: properties,
    },
    children: filteredChildren,
  }
}


function toMdast(node: HastContent) {
  if (node.type === 'text') {
    return {
      type: 'text',
      value: node.value,
    } as Text;
  }
  if (node.type === 'element') {
    const mdastNode = {
      type: 'admonitionHTML',
      data: {
        hName: node.tagName,
        hProperties: node.properties,
      },
      children: [],
    } as admonitionHTML;
    node.children.map(toMdast).forEach((child) => {
      if (child) {
        mdastNode.children.push(child);
      }
    });
    return mdastNode;
  }
  return null;
}

function htmlTemplate(
  type: string,
  title?: string | MdastContent,
  children?: (MdastContent | undefined | null | false)[],
) {
  const key = type in admonitionConfig ? type : 'note';
  const config = admonitionConfig[key];
  let titleNode  = null;
  if(typeof title === 'string') {
    titleNode = {
      type: 'text',
      value: title,
    } as Text;
  } else if (typeof title === 'undefined') {
    titleNode = {
      type: 'text',
      value: config.title,
    } as Text;
  } else {
    titleNode = title;
  }
  
  const iconNode = config.icon ? toMdast(fromHtml(config.icon, {
    space: 'svg',
    fragment: true,
  }).children[0]) : null;

  return h('div', {
    class: twMerge(
      'my-4 rounded-lg px-4 py-2',
      config.class,
    )
  }, [
    h('div', {
      class: 'flex items-center text-base font-bold',
    }, [iconNode, titleNode]),
    children && children.length > 0 && h('div', {
      class: 'mt-2 prose-compact text-sm',
    }, children)
  ])
}

export const fromMarkdown = (): FromMarkdownExtension => {
  const enterAdmonition: Handle = function(token) {
    const node: Admonition = {
      type: 'admonition',
      name: '',
      children: [],
    }
    this.enter(node, token);
  }
  const enterAdmonitionTitle: Handle = function(token) {
    this.enter({
      type: 'paragraph',
      data: {
        admonitionTitle: true,
      },
      children: [],
    }, token);
  }
  const exitAdmonition: Handle = function(token) {
    const node = this.stack[this.stack.length - 1] as Admonition;
    this.exit(token)
    const type = node.name;
    const titleNodeIndex = node.children.findIndex((child) => {
      return child.type === 'paragraph' && child.data?.admonitionTitle;
    });
    const titleNode = titleNodeIndex >= 0
      ? node.children.splice(titleNodeIndex, 1)[0] as Paragraph
      : undefined;
    if (titleNode) {
      titleNode.data = {
        ...titleNode.data,
        hName: 'span'
      }
    }
    const subtree = htmlTemplate(type, titleNode, node.children);
    if (subtree) {
      Object.assign(node, subtree);
    }
  }
  const exitAdmonitionName: Handle = function(token) {
    const node = this.stack[this.stack.length - 1] as Admonition;
    if (node.type === 'admonition') {
      node.name = this.sliceSerialize(token);
    }
  }
  const exitAdmonitionTitle: Handle = function(token) {
    this.exit(token);
  }
  return {
    enter: {
      admonition: enterAdmonition,
      admonitionTitle: enterAdmonitionTitle,
    },
    exit: {
      admonition: exitAdmonition,
      admonitionName: exitAdmonitionName,
      admonitionTitle: exitAdmonitionTitle,
    }
  }
}