---
title: 给你的Markdown扩展新语法吧：下篇
date: 2023-08-07
updateDate: 2023-12-28
tags: [Markdown, Remark, Unified, Javascript]
category: [前端]
image: ./cover.jpg
---

!!! info 注意
    这篇文章仅适用于基于 [Remark.js](https://github.com/remarkjs/remark) 开发的 Markdown 应用，如 Astro.js、MDX 等等。

!!! caution 版本更新提醒
    从 [mdast-util-from-markdown 2.0.0](https://github.com/syntax-tree/mdast-util-from-markdown/releases/tag/2.0.0) 开始，this.exit() 方法删除了返回值，不再返回 AST 节点，因此在该版本里，我们需要自己使用其他方法获取节点。例如：
    ```ts
    function exitMyNodeType(token) {
      const node = this.stack[this.stack.length - 1] as MyNodeType;
      this.exit(token);
      // previous code will case error
      // const node = this.exit(token) as MyNodeType;
    }
    ```
    该变更影响 remark 15.0.0 及以上版本，请注意你所使用的框架的依赖版本。

[上一篇文章](./扩展markdown语法-上篇) 讲了 Remark 扩展新语法的方法，现在我们就来实践吧。

在这篇文章里，我们将会实现两个有趣的新语法，分别是：

- Spoiler（黑幕）：形成对文字的遮挡效果，只有在鼠标悬停时才会显示。
- Admonition（警告框）：使用块级元素来强调一段文字，可以有不同的类型、颜色和图标。

## Spoiler

### 语法定义

先来介绍一下 Spoiler 的语法。使用 `!!` 双叹号包裹行内文本，文本将会具有 Spolier 效果。

```markdown
!!这是一条 Spoiler 测试文本。这是一条 Spoiler 测试文本。!!
```

效果如下（鼠标悬停在文本上，以显示文字）：!!这是一条 Spoiler 测试文本。这是一条 Spoiler 测试文本。!!

### 文件结构

```plaintext
- remarkSpoiler
  - syntax.ts       // micromark 扩展
  - fromMarkdown.ts // mdast-util-from-markdown 扩展
  - index.ts        // 插件入口
```

### micromark 扩展

```ts
import { markdownLineEnding } from 'micromark-util-character';
import { factorySpace } from 'micromark-factory-space';
import { codes, types, constants } from 'micromark-util-symbol';
import type { Construct, Tokenizer, State, Extension as MicromarkExtension } from 'micromark-util-types';

// 定义 spoiler Tokenizer
const tokenizeSpoiler: Tokenizer = function(effects, ok, nok) {
  const self = this;
  const start: State = function(code) {
    effects.enter('spoiler');
    return effects.attempt(
      marker,
      factorySpace(effects, contentStart, types.whitespace),
      nok
    )
  }
  const contentStart: State = function(code) {
    effects.enter(types.chunkText, {
      contentType: constants.contentTypeText,
    })
    return content;
  }
  const content: State = function(code) {
    return effects.check(
      marker,
      factorySpace(effects, contentAfter, types.whitespace),
      comsumeData
    )
  }
  const comsumeData: State = function(code) {
    if (markdownLineEnding(code) || code === codes.eof) {
      return nok;
    }
    effects.consume(code);
    return content;
  }
  const contentAfter: State = function(code) {
    effects.exit(types.chunkText);
    return effects.attempt(marker, after, nok);
  }
  const after: State = function(code) {
    effects.exit('spoiler');
    return ok;
  }
  return start;
}

// 定义分界符 (!!) 的 Tokenizer
const tokenizeMarker: Tokenizer = function(effects, ok, nok) {
  let markerSize = 0;
  if (this.previous === codes.exclamationMark) {
    return nok;
  }
  const start: State = function(code) {
    effects.enter('spoilerMarker');
    return marker;
  }
  const marker: State = function(code) {
    if (code === codes.exclamationMark) {
      effects.consume(code);
      markerSize++;
      return marker;
    }
    if (markerSize == 2) {
      effects.exit('spoilerMarker');
      markerSize = 0;
      return ok;
    }
    return nok;
  }
  return factorySpace(effects, start, types.whitespace);
}

const marker: Construct = {
  tokenize: tokenizeMarker,
  partial: true
}

const spoiler: Construct = {
  name: 'spoiler',
  tokenize: tokenizeSpoiler
}

export const syntax = (): MicromarkExtension => {
  return {
    text: {
      [codes.exclamationMark]: spoiler,
    }
  }
}
```

### mdast-util-from-markdown 扩展

在 html 上实现spoiler效果比较简易，只需要添加一些 css 即可。

```ts
import type { Parent } from 'mdast';
import type { Handle, Extension as FromMarkdownExtension } from 'mdast-util-from-markdown';

// 定义 spoiler 节点类型
export interface Spoiler extends Parent {
  type: 'spoiler',
};

// 声明自定义 mdast 类型
declare module 'mdast' {
  interface StaticPhrasingContentMap {
    spoiler: Spoiler;
  }
}

export const fromMarkdown = (): FromMarkdownExtension => {
  const enterSpoiler: Handle = function(token) {
    this.enter<Spoiler>({
      type: 'spoiler',
      children: [],
    }, token);
  }
  const exitSpoiler: Handle = function(token) {
    const node = this.exit(token) as Spoiler;
    node.data = {
      ...node.data,
      hName: 'span',
      hProperties: {
        className: 'bg-current hover:bg-transparent',
      },
    }
  }
  return {
    enter: {
      spoiler: enterSpoiler,
    },
    exit: {
      spoiler: exitSpoiler,
    }
  }
}
```

### 完善插件

这里编写了一个 `add` 工具函数，用来向对象中某列表属性添加元素，如果属性不存在则创建一个新的列表。

```ts
import type { Plugin } from 'unified';
import type { Root } from 'mdast';
import { syntax } from './syntax';
import { fromMarkdown } from './fromMarkdown';

const remarkSpoiler: Plugin<[], Root> = function() {
  const data = this.data();
  function add(key: string, value: unknown) {
    if (Array.isArray(data[key])) {
      (data[key] as unknown[]).push(value);
    } else {
      data[key] = [value];
    }
  }
  add('micromarkExtensions', syntax());
  add('fromMarkdownExtensions', fromMarkdown());
}
export default remarkSpoiler;
```

## Admonition

### 语法定义

使用三个叹号作为前缀，后面紧随 admonition 的类型，类型之后可以跟一个可选的标题，标题和类型之间用空格分隔。

从第二行开始为 admonition 的内容，需要有 4 个空格的缩进。如果下一行的内容仍然以 4 个空格缩进，则该内容块仍然属于 admonition，直到遇到非法缩进。

```markdown
!!! info 注意
    这是一条注意事项。
    !!! tip 提示：_标题可以带有格式_
        Admonition 可以嵌套使用。
```

!!! info 注意
    这是一条注意事项。
    !!! tip 提示：_标题可以带有格式_
        Admonition 可以嵌套使用。

### 文件结构

```plaintext
- remarkAdmonition
  - syntax.ts       // micromark 扩展
  - fromMarkdown.ts // mdast-util-from-markdown 扩展
  - index.ts        // 插件入口
  - styles.css      // 附加样式
```

### micromark 扩展

```ts
import { asciiAlpha, asciiAlphanumeric, markdownLineEnding, markdownSpace } from 'micromark-util-character';
import { factorySpace } from 'micromark-factory-space';
import { codes, types, constants } from 'micromark-util-symbol';
import type { TokenizeContext, Construct, Tokenizer, Effects, Exiter, State, Token, Extension as MicromarkExtension } from 'micromark-util-types';

// characters in name can be: a-z, A-Z, 0-9, -, _
// but the first character must be a-z or A-Z
function factoryName(
  this: TokenizeContext, 
  effects: Effects, 
  ok: State, 
  nok: State, 
  type: string
) {
  const self = this;
  const start: State = function(code) {
    if (asciiAlpha(code)) {
      effects.enter(type);
      effects.consume(code);
      return name;
    }
    return nok;
  }

  const name: State = function(code) {
    if (
      code === codes.dash ||
      code === codes.underscore ||
      asciiAlphanumeric(code)
    ) {
      effects.consume(code);
      return name;
    }
    effects.exit(type);
    return self.previous === codes.dash || self.previous === codes.underscore
      ? nok
      : ok;
  }
  return start;
}
// tokenizing title, the title can be any character except line ending
function factoryTitle(
  effects: Effects,
  ok: State,
  nok: State,
  type: string,
) {
  let previous: Token;
  const start: State = function(code) {
    effects.enter(type);
    return titleStart;
  }
  const titleStart: State = function(code) {
    if (markdownLineEnding(code) || code === codes.eof) {
      effects.exit(type);
      return ok;
    }
    const token = effects.enter(types.chunkText, {
      contentType: constants.contentTypeText,
      previous
    })
    if (previous) previous.next = token
    previous = token

    effects.consume(code);
    return title;
  }
  const title: State = function(code) {
    if (markdownLineEnding(code) || code === codes.eof) {
      effects.exit(types.chunkText);
      effects.exit(type);
      return ok;
    }
    effects.consume(code);
    return title;
  }
  return start;
}

const tokenizeIndent: Tokenizer = function(effects, ok, nok) {
  const self = this;
  const prefix: State = function(code) {
    if (!self.containerState) {
      throw new Error('expected state')
    }
    if (typeof self.containerState.indent !== 'number') {
      throw new Error('expected indent')
    }
    return factorySpace(
      effects,
      afterPrefix,
      'admonitionIndent',
      constants.tabSize + 1,
    )
  }

  const afterPrefix: State = function(code) {
    if (!self.containerState) {
      throw new Error('expected state')
    }
    const tail = self.events[self.events.length - 1]
    if (tail) {
      const [type, token, context] = tail;
      if (token.type === 'admonitionIndent'
        && token.end.column - 1 === self.containerState.indent) {
        return ok;
      }
    }
    return nok;
  }
  return prefix
}

const tokenizeBlankLine: Tokenizer = function(effects, ok, nok) {
  const self = this;
  const start: State = function(code) {
    return markdownSpace(code)
      ? factorySpace(effects, after, types.whitespace)
      : after
  }
  const after: State = function(code) {
    return code === codes.eof || markdownLineEnding(code) ? ok : nok
  }
  return start
}

const tokenizeAdmonitionStart: Tokenizer = function(effects, ok, nok) {
  // used for factoryName
  const self = this;
  // define data
  let markerSize = 0;
  const tail = self.events[self.events.length - 1];
  let initialIndent = 0;
  if (tail) {
    const [tailType, tailToken, tailContext] = tail;
    initialIndent = tailToken.type === 'admonitionIndent'
      ? tailContext.sliceSerialize(tailToken, true).length
      : 0;
  }
  if (!self.containerState) {
    throw new Error('expected state')
  }
  self.containerState.indent = initialIndent + constants.tabSize;
  // define states
  const start: State = function(code) {
    effects.enter('admonition');
    effects.enter('admonitionPrefix');
    if (code === codes.exclamationMark) {
      effects.enter('admonitionMarker');
      return marker;
    }
    return nok;
  }
  const marker: State = function(code) {
    if (code === codes.exclamationMark) {
      effects.consume(code);
      markerSize++;
      return marker;
    }
    if (markerSize !== 3) {
      return nok;
    }
    effects.exit('admonitionMarker');
    return afterMarker;
  }
  const afterMarker: State = function(code) {
    if (markdownSpace(code)) {
      return factorySpace(effects, afterMarker, types.whitespace);
    }
    return name;
  }
  const name: State = function(code) {
    return factoryName.call(self, effects, afterName, nok, 'admonitionName');
  }
  const afterName: State = function(code) {
    if (markdownSpace(code)) {
      return factorySpace(effects, afterName, types.whitespace);
    }
    if (markdownLineEnding(code) || code === codes.eof) {
      return after;
    }
    return title;
  }
  const title: State = function(code) {
    return factoryTitle(effects, afterTitle, nok, 'admonitionTitle');
  }
  const afterTitle: State = function(code) {
    if (!markdownLineEnding(code)) {
      effects.consume(code);
      // self.parser.lazy[t.start.line] = false
      return afterTitle;
    }
    return after;
  }
  const after: State = function(code) {
    effects.exit('admonitionPrefix');
    return ok;
  }
  return start;
}

const tokenizeAdmonitionContinuation: Tokenizer = function(effects, ok, nok) {
  return effects.check(blankLine, ok, effects.attempt(indent, ok, nok))
}

const exit: Exiter = function(effects) {
  effects.exit('admonition');
}

const indent: Construct = {tokenize: tokenizeIndent, partial: true}
const blankLine: Construct = {tokenize: tokenizeBlankLine, partial: true}
const admonition: Construct = {
  name: 'admonition',
  tokenize: tokenizeAdmonitionStart,
  continuation: {
    tokenize: tokenizeAdmonitionContinuation,
  },
  exit: exit,
}

export const syntax = (): MicromarkExtension => {
  return {
    document: {
      [codes.exclamationMark]: admonition,
    }
  }
}
```

### mdast-util-from-markdown 扩展

```ts
import type { Paragraph, Parent, Text, Content } from 'mdast';
import type { Content as HastContent } from 'hast';
import type { Handle, Extension as FromMarkdownExtension } from 'mdast-util-from-markdown';
import { fromHtml } from 'hast-util-from-html';

export interface Admonition extends Parent {
  type: 'admonition',
  name: string,
};
export interface admonitionHTML extends Parent {
  type: 'admonitionHTML',
}
declare module 'mdast' {
  interface BlockContentMap {
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
    icon: '<svg>...</svg>',
    class: 'admonition-note',
  },
  info: {
    title: '信息',
    icon: '...',
    class: 'admonition-info',
  },
  tip: {
    title: '提示',
    icon: '...',
    class: 'admonition-tip',
  },
  caution: {
    title: '注意',
    icon: '...',
    class: 'admonition-caution',
  },
  danger: {
    title: '危险',
    icon: '...',
    class: 'admonition-danger',
  },
}

function h (
  tagName: string,
  properties: Record<string, any>,
  children?: (Content | undefined | null | false)[],
): admonitionHTML {
  const filteredChildren = children?.filter<Content>((child): child is Content => {
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
  title?: string | Content,
  children?: (Content | undefined | null | false)[],
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
    class: 'my-4 rounded-lg px-4 py-2 ' + config.class,
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
    this.enter<Admonition>({
      type: 'admonition',
      name: '',
      children: [],
    }, token);
  }
  const enterAdmonitionTitle: Handle = function(token) {
    this.enter<Paragraph>({
      type: 'paragraph',
      data: {
        admonitionTitle: true,
      },
      children: [],
    }, token);
  }
  const exitAdmonition: Handle = function(token) {    
    const node = this.exit(token) as Admonition;
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
```

### 完善插件

```ts
import type { RemarkPlugin } from '@astrojs/markdown-remark';
import { syntax } from './syntax';
import { fromMarkdown } from './fromMarkdown';

const remarkAdmonition: RemarkPlugin<[]> = function() {
  const data = this.data();

  function add(key: string, value: unknown) {
    if (Array.isArray(data[key])) {
      (data[key] as unknown[]).push(value);
    } else {
      data[key] = [value];
    }
  }
  add('micromarkExtensions', syntax());
  add('fromMarkdownExtensions', fromMarkdown());

}
export default remarkAdmonition;
```
