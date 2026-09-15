"use client";

import { useRef, useState } from "react";
import { useEditor, EditorContent, type JSONContent } from "@tiptap/react";
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Link as LinkIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ImagePlus,
} from "lucide-react";
import { getTiptapExtensions } from "@/lib/tiptap-extensions";
import { uploadImage } from "@/lib/upload";

interface TiptapEditorProps {
  content: JSONContent;
  onChange: (json: JSONContent) => void;
}

function ToolbarButton({
  onClick,
  active,
  disabled,
  label,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-pressed={active}
      title={label}
      className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors disabled:opacity-40 ${
        active ? "bg-accent text-accent-foreground" : "hover:bg-surface"
      }`}
    >
      {children}
    </button>
  );
}

export function TiptapEditor({ content, onChange }: TiptapEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const editor = useEditor({
    extensions: getTiptapExtensions(),
    content,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "prose-article min-h-[420px] px-4 py-3 focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getJSON()),
  });

  function setLink() {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL", previousUrl || "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }

  async function handleImageSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !editor) return;

    const alt = window.prompt("Alt text for this image (required for accessibility and SEO)");
    if (!alt || !alt.trim()) {
      setUploadError("An image needs alt text — upload cancelled.");
      return;
    }

    setUploadError("");
    setIsUploading(true);
    try {
      const url = await uploadImage(file);
      editor.chain().focus().setImage({ src: url, alt: alt.trim() }).run();
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setIsUploading(false);
    }
  }

  if (!editor) {
    return (
      <div className="min-h-[460px] w-full animate-pulse rounded-md border border-border bg-surface" />
    );
  }

  return (
    <div className="overflow-hidden rounded-md border border-border bg-background">
      <div className="max-h-[70vh] overflow-y-auto">
        <div className="sticky top-0 z-10 flex flex-wrap items-center gap-1 border-b border-border bg-background p-2">
        <ToolbarButton
          label="Bold"
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold size={16} />
        </ToolbarButton>
        <ToolbarButton
          label="Italic"
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic size={16} />
        </ToolbarButton>
        <ToolbarButton
          label="Heading 2"
          active={editor.isActive("heading", { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <Heading2 size={16} />
        </ToolbarButton>
        <ToolbarButton
          label="Heading 3"
          active={editor.isActive("heading", { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          <Heading3 size={16} />
        </ToolbarButton>
        <ToolbarButton
          label="Bullet list"
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List size={16} />
        </ToolbarButton>
        <ToolbarButton
          label="Numbered list"
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered size={16} />
        </ToolbarButton>
        <ToolbarButton label="Link" active={editor.isActive("link")} onClick={setLink}>
          <LinkIcon size={16} />
        </ToolbarButton>

        <span className="mx-1 h-5 w-px bg-border" aria-hidden="true" />

        <ToolbarButton
          label="Align left"
          active={editor.isActive({ textAlign: "left" })}
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
        >
          <AlignLeft size={16} />
        </ToolbarButton>
        <ToolbarButton
          label="Align center"
          active={editor.isActive({ textAlign: "center" })}
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
        >
          <AlignCenter size={16} />
        </ToolbarButton>
        <ToolbarButton
          label="Align right"
          active={editor.isActive({ textAlign: "right" })}
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
        >
          <AlignRight size={16} />
        </ToolbarButton>

        <span className="mx-1 h-5 w-px bg-border" aria-hidden="true" />

        <ToolbarButton
          label="Insert image"
          disabled={isUploading}
          onClick={() => fileInputRef.current?.click()}
        >
          <ImagePlus size={16} />
        </ToolbarButton>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={handleImageSelected}
        />
        {isUploading && <span className="text-xs text-muted">Uploading…</span>}
        </div>

        {uploadError && (
          <p className="border-b border-border px-4 py-2 text-xs text-red-500">{uploadError}</p>
        )}

        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
