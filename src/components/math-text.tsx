import katex from 'katex';

// All non-math text is escaped by React. KaTeX trust is disabled: no HTML or remote assets.
export function MathText({ text }: { text: string }) {
  const chunks = text.split(
    /(`[^`]+`|\$\$[\s\S]*?\$\$|(?<!\$)\$(?!\$)[^$\n]+\$|\[[^\]\n]+\]\(https?:\/\/[^\s)]+\)|\*\*[^*]+\*\*)/g,
  );
  return (
    <div className="math-prose">
      {chunks.map((part, i) => {
        if (part.startsWith('`') && part.endsWith('`'))
          return <code key={i}>{part.slice(1, -1)}</code>;
        if (part.startsWith('**') && part.endsWith('**'))
          return <strong key={i}>{part.slice(2, -2)}</strong>;
        const link = part.match(/^\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)$/);
        if (link)
          return (
            <a key={i} href={link[2]} target="_blank" rel="noreferrer">
              {link[1]}
            </a>
          );
        const display = part.startsWith('$$') && part.endsWith('$$');
        const inline = !display && part.startsWith('$') && part.endsWith('$') && part.length > 1;
        if (display || inline) {
          const source = part.slice(display ? 2 : 1, display ? -2 : -1);
          const html = katex.renderToString(source, {
            displayMode: display,
            throwOnError: false,
            trust: false,
            strict: 'ignore',
            maxExpand: 500,
            maxSize: 20,
          });
          return (
            <span
              key={i}
              className={display ? 'display-math' : undefined}
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </div>
  );
}
