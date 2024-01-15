import {
  asciiAlpha,
  asciiAlphanumeric,
  markdownLineEnding,
  markdownSpace
} from 'micromark-util-character';
import { factorySpace } from 'micromark-factory-space';
// import { codes } from 'micromark-util-symbol/lib/codes';
// import { types } from 'micromark-util-symbol/lib/types';
import { codes, types, constants } from 'micromark-util-symbol';

import type {
  TokenizeContext,
  Construct,
  Tokenizer,
  Effects,
  Exiter,
  State,
  Token,
  TokenType,
  Extension as MicromarkExtension,
} from 'micromark-util-types';

declare module 'micromark-util-types' {
  interface TokenTypeMap {
    admonition: 'admonition';
    admonitionPrefix: 'admonitionPrefix';
    admonitionMarker: 'admonitionMarker';
    admonitionName: 'admonitionName';
    admonitionTitle: 'admonitionTitle';
    admonitionIndent: 'admonitionIndent';
  }
  interface ContainerState {
    indent?: number;
  }
}


// characters in name can be: a-z, A-Z, 0-9, -, _
// but the first character must be a-z or A-Z
function factoryName(
  this: TokenizeContext, 
  effects: Effects, 
  ok: State, 
  nok: State, 
  type: TokenType
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
  type: TokenType,
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