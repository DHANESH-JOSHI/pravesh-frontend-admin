"use client";

import { Editor } from "@tinymce/tinymce-react";

interface BlogEditorProps {
    value: string;
    onChange: (value: string) => void;
}

export default function BlogEditor({ value, onChange }: BlogEditorProps) {
    return (
        <Editor
            apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY}
            onEditorChange={onChange}
            value={value}
            init={{
                plugins:
                    "anchor autolink charmap codesample emoticons image link lists media searchreplace table visualblocks wordcount",
                toolbar:
                    "undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table | align lineheight | numlist bullist indent outdent | emoticons charmap | removeformat",
                height: 435,
            }}
        />
    );
}
