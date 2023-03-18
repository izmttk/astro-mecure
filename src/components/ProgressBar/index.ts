import React from 'react';
import ReactDOM from 'react-dom';
import { createRoot, Root } from 'react-dom/client';
import ProgressBar from './ProgressBar';
import type { ProgressBarProps } from './ProgressBar';

let progress = 0;
let root: Root | null = null;
let interval: NodeJS.Timer | null = null;

function render(props: ProgressBarProps) {
  if(!root) {
    root = createRoot(document.createElement('div'));
  }
  const portal = ReactDOM.createPortal(React.createElement(ProgressBar, props), document.body);
  root.render(portal);
}

function unmount() {
  if (root) {
    root.unmount();
    root = null;
  }
}

function start() {
  update(20);
  if (interval) {
    clearInterval(interval);
  }
  interval = setInterval(() => {
    if (progress + 8 <= 90) {
      update(progress + 8);
    } else if (progress < 90 && progress + 8 > 90) {
      update(90);
    }
  }, 1000);
}

function update(value: number) {
  progress = value;
  render({progress: progress})
}

function finish() {
  if (interval) {
    clearInterval(interval);
  }
  interval = null;
  progress = 100;
  render({
    progress,
    onAnimationEnd: () => {
      unmount();
    }
  })
}

export default {
  start,
  update,
  finish,
  render,
  unmount,
};
