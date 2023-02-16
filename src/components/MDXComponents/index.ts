import Mermaid from './Mermaid/Mermaid.astro';
import Admonition from './Admonition';
import { CH } from './CodeHike';

const MDXComponents = {
  mermaid: Mermaid,
  admonition: Admonition,
  CH,
}

export default MDXComponents;
