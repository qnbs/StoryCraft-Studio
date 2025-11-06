import React from 'react';
import { useAppSelector } from '../../app/hooks';

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, style, ...props }, ref) => {
    const settings = useAppSelector((state) => state.settings);

    const fontMap = {
        'serif': 'serif',
        'sans-serif': 'sans-serif',
        'monospace': 'monospace'
    };

    const editorStyles: React.CSSProperties = {
        fontFamily: fontMap[settings.editorFont],
        fontSize: `${settings.fontSize}px`,
        lineHeight: settings.lineSpacing,
    };

    return (
      <textarea
        className={`flex min-h-[120px] w-full rounded-md border border-[var(--border-primary)] bg-[var(--background-secondary)] px-3 py-2 text-sm text-[var(--foreground-primary)] placeholder:text-[var(--foreground-muted)] focus:outline-none focus:border-[var(--border-interactive)] focus:ring-2 focus:ring-[var(--ring-focus)] focus:ring-offset-2 focus:ring-offset-[var(--background-primary)] ${className}`}
        ref={ref}
        style={{ ...editorStyles, ...style }}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';