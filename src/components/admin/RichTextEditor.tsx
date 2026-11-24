"use client";

import React from "react";
import dynamic from "next/dynamic";
import "ckeditor5/ckeditor5.css";

const CKEditorInner = dynamic(
  async () => {
    const [{ CKEditor }, ck] = await Promise.all([
      import("@ckeditor/ckeditor5-react"),
      import("ckeditor5"),
    ]);

    const {
      ClassicEditor,
      Essentials,
      Paragraph,
      Bold,
      Italic,
      Underline,
      Heading,
      Link,
      List,
      BlockQuote,
      Undo,
    } = ck;

    return function EditorWrapper({
      value,
      onChange,
      placeholder,
    }: {
      value: string;
      onChange: (val: string) => void;
      placeholder?: string;
    }) {
      return (
        <div className="ck-content-wrapper rounded-xl overflow-hidden border border-neutral-300 bg-white">
          <CKEditor
            editor={ClassicEditor}
            data={value}
            config={{
              licenseKey: "GPL",
              plugins: [
                Essentials,
                Paragraph,
                Bold,
                Italic,
                Underline,
                Heading,
                Link,
                List,
                BlockQuote,
                Undo,
              ],
              toolbar: [
                "undo",
                "redo",
                "|",
                "heading",
                "|",
                "bold",
                "italic",
                "underline",
                "|",
                "link",
                "bulletedList",
                "numberedList",
                "blockQuote",
              ],
              placeholder: placeholder ?? "İçeriği buraya yazın...",
            }}
            onChange={(_event, editor) => {
              onChange(editor.getData());
            }}
          />
        </div>
      );
    };
  },
  {
    ssr: false,
    loading: () => (
      <div className="h-44 rounded-xl border border-neutral-300 bg-neutral-50 animate-pulse" />
    ),
  }
);

export function RichTextEditor({
  label,
  value,
  onChange,
  placeholder,
}: {
  label?: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-xs font-bold text-neutral-700">
          {label}
        </label>
      )}
      <CKEditorInner value={value} onChange={onChange} placeholder={placeholder} />
    </div>
  );
}
