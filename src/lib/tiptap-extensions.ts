import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Image from "@tiptap/extension-image";

// Shared between the client editor (PostForm/TiptapEditor) and the seed
// script's markdown-to-JSON conversion (src/scripts/seed.ts), so both
// build documents against the exact same schema TiptapContent renders.
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
