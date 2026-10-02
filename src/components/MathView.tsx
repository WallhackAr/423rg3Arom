import React, { useMemo } from 'react';
import katex from 'katex';

interface MathViewProps {
  math: string;
  block?: boolean;
  className?: string;
}

export const MathView: React.FC<MathViewProps> = ({ math, block = false, className = '' }) => {
  const html = useMemo(() => {
    try {
      return katex.renderToString(math, {
        displayMode: block,
        throwOnError: false,
      });
    } catch {
      return `<code>${math}</code>`;
    }
  }, [math, block]);

  if (block) {
    return (
      <div
        className={`overflow-x-auto py-1 text-slate-100 ${className}`}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  return (
    <span
      className={`inline-block text-slate-100 ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};
