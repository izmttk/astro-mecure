import Mermaid from './Mermaid';
import Admonition from './Admonition';
import { H1, H2, H3, H4, H5, H6 } from './Heading';
// import { CH } from './CodeHike';

const MDXComponents = {
  mermaid: Mermaid,
  admonition: Admonition,
  h1: H1,
  h2: H2,
  h3: H3,
  h4: H4,
  h5: H5,
  h6: H6,
  // CH,
}

export default MDXComponents;
