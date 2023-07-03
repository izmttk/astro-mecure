// from https://github.com/facebook/docusaurus/blob/6b618bc9e5fcc9d52d3aa49a9d447f4d7ea76d41/packages/docusaurus-theme-mermaid/src/client/index.ts
/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {useEffect, useMemo, useState} from 'react';
import useTheme from '@/hooks/useTheme';
import type { MermaidConfig } from 'mermaid';
import mermaid from 'mermaid';

export default function useMermaidSvg(
  txt: string,
  mermaidConfigParam?: MermaidConfig,
): string {
  const {colorMode} = useTheme();
  const mermaidConfig = useMemo(() => {
    const defaultMermaidConfig: MermaidConfig = {
      startOnLoad: false, 
      theme: colorMode === 'dark' ? 'dark' : 'default',
    };
    return mermaidConfigParam
      ? {
          ...defaultMermaidConfig,
          ...mermaidConfigParam,
        }
      : defaultMermaidConfig;
  }, [mermaidConfigParam, colorMode]);

  const [svg, setSvg] = useState('');
  useEffect(() => {
    mermaid.mermaidAPI.initialize(mermaidConfig);

    const mermaidId = `mermaid-svg-${Math.round(Math.random() * 10000000)}`;
  
    mermaid.mermaidAPI.render(mermaidId, txt).then((result) => {
      setSvg(result.svg);
    })
  }, [txt, mermaidConfig]);
  return svg;
}