import Annotation from './Annotation.astro'
import Code from './Code.astro'
import CodeSlot from './CodeSlot.astro'
import InlineCode from './InlineCode.astro'
import { annotations } from '@code-hike/mdx/components';


// Don't use the following components, they are unavailable in astro currently.
// Section, SectionLink, SectionCode, Spotlight, Scrollycoding, Preview, Slideshow, PreviewSlot

const CH = {
  Code,
  annotations,
  Annotation,
  InlineCode,
  CodeSlot,
};

export {
  CH,
  Annotation,
  Code,
  CodeSlot,
  InlineCode,
  annotations
};
