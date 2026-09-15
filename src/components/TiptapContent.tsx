import type { ReactNode } from "react";
import Image from "next/image";
import type { JSONContent } from "@tiptap/core";
import { extractHeadings, isValidTiptapDoc } from "@/lib/headings";
import { isSafeUrl } from "@/lib/safe-url";

// Renders Tiptap JSON directly to React elements — no HTML string and no
// dangerouslySetInnerHTML, which is what makes it safe (React escapes all
// text content automatically) and what lets in-article images use
// next/image (impossible with a raw HTML string). The one thing React does
// NOT guard against on its own is a dangerous URL scheme in an href/src, so
// isSafeUrl() stands in for what sanitize-html's allowedSchemes used to do.
// No fixed image dimensions are known (nothing captured at upload time), so
// width/height are just next/image's required srcset hint — h-auto w-full
// makes the image actually display at its own aspect ratio.

function textAlignStyle(node: JSONContent): React.CSSProperties | undefined {
  const align = node.attrs?.textAlign;
  return align && align !== "left" ? { textAlign: align } : undefined;
}

function renderTextNode(node: JSONContent, key: number): ReactNode {
  const marks = node.marks ?? [];
  let el: ReactNode = node.text ?? "";

  for (const mark of marks) {
    if (mark.type === "bold") el = <strong>{el}</strong>;
    else if (mark.type === "italic") el = <em>{el}</em>;
    else if (mark.type === "strike") el = <s>{el}</s>;
    else if (mark.type === "code") el = <code>{el}</code>;
    else if (mark.type === "link") {
      const href = String(mark.attrs?.href ?? "");
      if (isSafeUrl(href)) {
        el = (
          <a href={href} target="_blank" rel="noopener noreferrer">
            {el}
          </a>
        );
      }
    }
  }

  return <span key={key}>{el}</span>;
}

function renderInline(node: JSONContent, key: number): ReactNode {
  if (node.type === "text") return renderTextNode(node, key);
  if (node.type === "hardBreak") return <br key={key} />;
  return null;
}

export function TiptapContent({ doc }: { doc: JSONContent }) {
  if (!isValidTiptapDoc(doc)) {
    // Previously this fell through to (doc.content ?? []).map(...) and
    // rendered a silent, empty <div> — a blank article body with no error
    // anywhere. Surface it instead: a clear server log line (visible in
    // Vercel function logs) plus a visible reader-facing message rather
    // than a page that looks broken with no indication why.
    console.error(
      "TiptapContent: received a value that isn't valid Tiptap JSON (expected {type:'doc', content:[...]}) — rendering a fallback instead of silently showing nothing.",
      { receivedType: typeof doc, isArray: Array.isArray(doc) }
    );
    return (
      <div className="prose-article">
        <p className="text-muted">
          This article&apos;s content couldn&apos;t be displayed. We&apos;ve been notified.
        </p>
      </div>
    );
  }

  const headings = extractHeadings(doc);
  const headingCursor = { index: 0 };

  function renderNode(node: JSONContent, key: number): ReactNode {
    const children = () => (node.content ?? []).map((child, i) => renderInline(child, i));
    const blockChildren = () => (node.content ?? []).map((child, i) => renderNode(child, i));

    switch (node.type) {
      case "paragraph":
        return (
          <p key={key} style={textAlignStyle(node)}>
            {children()}
          </p>
        );

      case "heading": {
        const rawLevel = node.attrs?.level;
        if (rawLevel !== 2 && rawLevel !== 3) {
          // extractHeadings (lib/headings.ts) only ever adds an entry for
          // level 2/3 — matching that check here, not just defaulting
          // anything-not-3 to level 2, is what keeps headingCursor.index in
          // sync with the headings[] array below. Rendering an off-schema
          // heading level as if it were real would silently desync every
          // id assigned after it.
          return (
            <p key={key} style={textAlignStyle(node)}>
              {children()}
            </p>
          );
        }
        const heading = headings[headingCursor.index];
        headingCursor.index += 1;
        const style = textAlignStyle(node);
        return rawLevel === 3 ? (
          <h3 key={key} id={heading?.id} style={style}>
            {children()}
          </h3>
        ) : (
          <h2 key={key} id={heading?.id} style={style}>
            {children()}
          </h2>
        );
      }

      case "bulletList":
        return <ul key={key}>{blockChildren()}</ul>;

      case "orderedList":
        return <ol key={key}>{blockChildren()}</ol>;

      case "listItem":
        return <li key={key}>{blockChildren()}</li>;

      case "blockquote":
        return <blockquote key={key}>{blockChildren()}</blockquote>;

      case "codeBlock":
        return (
          <pre key={key}>
            <code>{(node.content ?? []).map((c) => c.text ?? "").join("")}</code>
          </pre>
        );

      case "horizontalRule":
        return <hr key={key} />;

      case "image": {
        const src = String(node.attrs?.src ?? "");
        const alt = String(node.attrs?.alt ?? "");
        if (!src || !isSafeUrl(src)) return null;
        return (
          <Image
            key={key}
            src={src}
            alt={alt}
            width={1200}
            height={800}
            sizes="(min-width: 768px) 700px, 100vw"
            className="my-6 h-auto w-full rounded-lg"
          />
        );
      }

      default:
        return null;
    }
  }

  return <div className="prose-article">{(doc.content ?? []).map((n, i) => renderNode(n, i))}</div>;
}
