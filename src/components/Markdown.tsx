"use client";

interface Props {
  children: string;
}

function renderInline(text: string) {
  const nodes: React.ReactNode[] = [];
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = regex.exec(text))) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    const t = m[0];
    if (t.startsWith("**")) nodes.push(<b key={i++}>{t.slice(2, -2)}</b>);
    else if (t.startsWith("`")) nodes.push(<code key={i++} className="rounded bg-ink-100 dark:bg-ink-800 px-1 py-0.5 text-xs">{t.slice(1, -1)}</code>);
    else nodes.push(<em key={i++}>{t.slice(1, -1)}</em>);
    last = regex.lastIndex;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

export default function Markdown({ children }: Props) {
  const lines = children.split("\n");
  const blocks: React.ReactNode[] = [];
  let listBuf: string[] | null = null;
  let blockquoteBuf: string[] | null = null;
  let key = 0;

  const flushList = () => {
    if (listBuf) {
      blocks.push(
        <ul key={key++} className="list-disc list-inside space-y-1 my-2 text-sm">
          {listBuf.map((li, i) => (
            <li key={i}>{renderInline(li)}</li>
          ))}
        </ul>
      );
      listBuf = null;
    }
  };

  const flushBlockquote = () => {
    if (blockquoteBuf) {
      blocks.push(
        <blockquote
          key={key++}
          className="border-l-2 border-calm-400 pl-3 my-2 text-sm text-ink-500 italic"
        >
          {blockquoteBuf.map((b, i) => (
            <p key={i}>{renderInline(b)}</p>
          ))}
        </blockquote>
      );
      blockquoteBuf = null;
    }
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (!line.trim()) {
      flushList();
      flushBlockquote();
      continue;
    }
    if (line.startsWith("# ")) {
      flushList();
      flushBlockquote();
      blocks.push(
        <h1 key={key++} className="text-xl font-semibold mt-3 mb-2">
          {renderInline(line.slice(2))}
        </h1>
      );
    } else if (line.startsWith("## ")) {
      flushList();
      flushBlockquote();
      blocks.push(
        <h2 key={key++} className="text-base font-semibold mt-4 mb-1.5">
          {renderInline(line.slice(3))}
        </h2>
      );
    } else if (line.startsWith("### ")) {
      flushList();
      flushBlockquote();
      blocks.push(
        <h3 key={key++} className="text-sm font-semibold mt-3 mb-1">
          {renderInline(line.slice(4))}
        </h3>
      );
    } else if (line.startsWith("- ") || line.startsWith("* ")) {
      flushBlockquote();
      listBuf = listBuf ?? [];
      listBuf.push(line.slice(2));
    } else if (line.startsWith("> ")) {
      flushList();
      blockquoteBuf = blockquoteBuf ?? [];
      blockquoteBuf.push(line.slice(2));
    } else {
      flushList();
      flushBlockquote();
      blocks.push(
        <p key={key++} className="text-sm leading-relaxed my-1.5">
          {renderInline(line)}
        </p>
      );
    }
  }
  flushList();
  flushBlockquote();
  return <div>{blocks}</div>;
}
