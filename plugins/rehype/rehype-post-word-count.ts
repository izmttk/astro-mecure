import type { RehypePlugin, MarkdownAstroData } from '@astrojs/markdown-remark';
import { toText as hastToText } from 'hast-util-to-text';

export interface Result {
  paragraphs: number;
  sentences: number;
  words: number;
  characters: number;
  all: number;
}

export interface Options {
  hardReturns?: boolean;
  stripTags?: boolean;
  ignore?: string[];
}

/**
 * `ucs2decode` function from the punycode.js library.
 *
 * Creates an array containing the decimal code points of each Unicode
 * character in the string. While JavaScript uses UCS-2 internally, this
 * function will convert a pair of surrogate halves (each of which UCS-2
 * exposes as separate characters) into a single code point, matching
 * UTF-16.
 *
 * @see     http://goo.gl/8M09r
 * @see     http://goo.gl/u4UUC
 *
 * @param   {String}  string   The Unicode input string (UCS-2).
 *
 * @return  {Array}   The new array of code points.
 */

function decode(string: string) {
  const output: number[] = [];
  let counter = 0;
  const length = string.length;

  while (counter < length) {
    const value = string.charCodeAt(counter++);

    if (value >= 0xd800 && value <= 0xdbff && counter < length) {
      // It's a high surrogate, and there is a next character.

      const extra = string.charCodeAt(counter++);

      if ((extra & 0xfc00) == 0xdc00) {
        // Low surrogate.
        output.push(
          ((value & 0x3ff) << 10) + (extra & 0x3ff) + 0x10000
        );
      } else {
        // It's an unmatched surrogate; only append this code unit, in case the
        // next code unit is the high surrogate of a surrogate pair.

        output.push(value);
        counter--;
      }
    } else {
      output.push(value);
    }
  }

  return output;
}

/**
 * `count` counts paragraphs, sentences, words, characters and characters
 *  plus spaces.
 *
 * @param   {String}       target   The target for the count.
 *
 * @param   {Object}       options  The options to use for the counting.
 *
 * @return  {Object}       The object containing the number of paragraphs,
 *                         sentences, words, characters and characters
 *                         plus spaces.
 */

function count(target: string, options: Options = {}): Result {
  let original = target;
  /**
   * The initial implementation to allow for HTML tags stripping was created
   * @craniumslows while the current one was created by @Rob--W.
   *
   * @see http://goo.gl/Exmlr
   * @see http://goo.gl/gFQQh
   */

  if (options.stripTags) original = original.replace(/<\/?[a-z][^>]*>/gi, "");

  if (options.ignore) {
    options.ignore.forEach((i) => {
      original = original.replace(i, "");
    });
  }

  const trimmed = original.trim();

  /**
   * Most of the performance improvements are based on the works of @epmatsw.
   *
   * @see http://goo.gl/SWOLB
   */

  return {
    paragraphs: trimmed ? (trimmed.match(options.hardReturns ? /\n{2,}/g : /\n+/g) || []).length + 1 : 0,
    sentences: trimmed ? (trimmed.match(/[.?!…]+./g) || []).length + 1 : 0,
    words: trimmed ? (trimmed.replace(/['";:,.?¿\-!¡]+/g, "").match(/\S+/g) || []).length : 0,
    characters: trimmed ? decode(trimmed.replace(/\s/g, "")).length : 0,
    all: decode(original).length,
  };
}

const rehypePostWordCount: RehypePlugin = () => {
  return (tree, file) => {
    const { frontmatter } = file.data.astro as MarkdownAstroData;
    frontmatter.wordCount = count(hastToText(tree)).characters;
  };
};

export default rehypePostWordCount;
