import { useEffect } from "react";

function addStyle(path: string) {
  const style = document.createElement('link');
  style.rel = 'stylesheet';
  style.href = path;
  style.type = 'text/css';
  document.head.appendChild(style);
  return style;
}

function useStylesheet(path: string) : void;
function useStylesheet(path: string[]) : void;
function useStylesheet(path: string | string[]) {
  if (Array.isArray(path)) {
    useEffect(() => {
      const styleElelemts = path.map(addStyle);
      return () => {
        styleElelemts.forEach(style => style.remove());
      };
    }, []);
  } else if (typeof path === 'string') {
    useEffect(() => {
      const styleElelemt = addStyle(path);
      return () => {
        styleElelemt.remove();
      };
    }, []);
  }
}
export default useStylesheet;
