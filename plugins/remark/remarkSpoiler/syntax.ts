import {
  markdownLineEnding,
  markdownSpace
} from 'micromark-util-character';

import { codes, types, constants } from 'micromark-util-symbol';

import type {
  Construct,
  Tokenizer,
  State,
  Extension as MicromarkExtension,
} from 'micromark-util-types';


const tokenizeSpoiler: Tokenizer = function(effects, ok, nok) {
  const self = this;
  const start: State = function(code) {
    effects.enter('spoiler');
    return effects.attempt(
      marker,
      contentStart,
      nok
    )
  }
  const contentStart: State = function(code) {
    if (markdownSpace(code)) {
      return nok;
    }
    effects.enter(types.chunkText, {
      contentType: constants.contentTypeText,
    })
    return content;
  }
  const content: State = function(code) {
    if (code === codes.exclamationMark) {
      return effects.check(
        marker,
        contentAfter,
        comsumeData
      )
    }
    return comsumeData;
  }
  const comsumeData: State = function(code) {
    if (markdownLineEnding(code) || code === codes.eof) {
      return nok;
    }
    if (code === codes.exclamationMark) {
      effects.consume(code);
      return comsumeData;
    }
    effects.consume(code);
    return content;
  }
  const contentAfter: State = function(code) {
    if (markdownSpace(self.previous)) {
      return nok;
    }
    effects.exit(types.chunkText);
    return effects.attempt(marker, after, nok);
  }
  const after: State = function(code) {
    effects.exit('spoiler');
    return ok;
  }
  return start;
}

const tokenizeMarker: Tokenizer = function(effects, ok, nok) {
  let markerSize = 0;
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
  return start;
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