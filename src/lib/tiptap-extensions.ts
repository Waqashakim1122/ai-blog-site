import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Image from "@tiptap/extension-image";

// Shared between the client editor (PostForm/TiptapEditor) and the
// server-side HTML renderer (lib/tiptap.ts) so the two can never drift —
// what the author sees while typing is exactly what gets rendered.
export function getTiptapExtensions() {
  return [
    StarterKit.configure({
      heading: { levels: [2, 3] },
    }),
    TextAlign.configure({
      types: ["heading", "paragraph"],
    }),
    Image.configure({
      HTMLAttributes: { loading: "lazy" },
    }),
  ];
}
