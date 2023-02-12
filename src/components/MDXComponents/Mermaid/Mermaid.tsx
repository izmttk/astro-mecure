// from https://github.com/facebook/docusaurus/blob/6b618bc9e5fcc9d52d3aa49a9d447f4d7ea76d41/packages/docusaurus-theme-mermaid/src/theme/Mermaid/index.tsx
/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import NoSSR from '../../NoSSR';
import {
  MermaidContainerClassName,
  useMermaidSvg,
} from './client';

import styles from './Mermaid.module.css';

export interface MermaidProps {
  value: string;
}

function MermaidDiagram({value}: MermaidProps) {
  const svg = useMermaidSvg(value);
  return (
    <div
      className={`${MermaidContainerClassName} ${styles.container}`}
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{__html: svg}}
    />
  );
}

export default function Mermaid(props: MermaidProps) {
  return (
    <NoSSR>
      <MermaidDiagram {...props} />
    </NoSSR>
  );
}
