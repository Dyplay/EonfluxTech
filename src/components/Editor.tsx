import React, { useEffect, useState } from 'react';
import { useEditor, EditorContent, Editor as TiptapEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import { FiBold, FiItalic, FiUnderline, FiLink, FiImage, FiList, FiAlignLeft, 
  FiAlignCenter, FiAlignRight, FiCode, FiEye, FiEdit } from 'react-icons/fi';
import DOMPurify from 'isomorphic-dompurify';

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const MenuBar = ({ editor }: { editor: TiptapEditor | null }) => {
  if (!editor) {
    return null;
  }

  const addImage = () => {
    const url = window.prompt('Enter the URL of the image:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Enter the URL:', previousUrl);

    // cancelled
    if (url === null) {
      return;
    }

    // empty
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    // update link
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  return (
    <div className="flex flex-wrap gap-1 p-2 bg-accent rounded-t-lg border border-border mb-2">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-2 rounded ${editor.isActive('bold') ? 'bg-primary/20' : 'hover:bg-accent-foreground/10'}`}
        title="Bold"
      >
        <FiBold className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-2 rounded ${editor.isActive('italic') ? 'bg-primary/20' : 'hover:bg-accent-foreground/10'}`}
        title="Italic"
      >
        <FiItalic className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={`p-2 rounded ${editor.isActive('underline') ? 'bg-primary/20' : 'hover:bg-accent-foreground/10'}`}
        title="Underline"
      >
        <FiUnderline className="w-4 h-4" />
      </button>

      <div className="w-px h-6 mx-1 bg-border self-center" />

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`p-2 rounded ${editor.isActive('heading', { level: 2 }) ? 'bg-primary/20' : 'hover:bg-accent-foreground/10'}`}
        title="Heading 2"
      >
        <span className="font-bold">H2</span>
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={`p-2 rounded ${editor.isActive('heading', { level: 3 }) ? 'bg-primary/20' : 'hover:bg-accent-foreground/10'}`}
        title="Heading 3"
      >
        <span className="font-bold">H3</span>
      </button>

      <div className="w-px h-6 mx-1 bg-border self-center" />

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-2 rounded ${editor.isActive('bulletList') ? 'bg-primary/20' : 'hover:bg-accent-foreground/10'}`}
        title="Bullet List"
      >
        <FiList className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`p-2 rounded ${editor.isActive('orderedList') ? 'bg-primary/20' : 'hover:bg-accent-foreground/10'}`}
        title="Ordered List"
      >
        <span className="font-bold">1.</span>
      </button>

      <div className="w-px h-6 mx-1 bg-border self-center" />

      <button
        type="button"
        onClick={setLink}
        className={`p-2 rounded ${editor.isActive('link') ? 'bg-primary/20' : 'hover:bg-accent-foreground/10'}`}
        title="Link"
      >
        <FiLink className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={addImage}
        className="p-2 rounded hover:bg-accent-foreground/10"
        title="Insert Image"
      >
        <FiImage className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={`p-2 rounded ${editor.isActive('codeBlock') ? 'bg-primary/20' : 'hover:bg-accent-foreground/10'}`}
        title="Code Block"
      >
        <FiCode className="w-4 h-4" />
      </button>

      <div className="w-px h-6 mx-1 bg-border self-center" />

      <button
        type="button"
        onClick={() => editor.chain().focus().undo().run()}
        className="p-2 rounded hover:bg-accent-foreground/10"
        title="Undo"
        disabled={!editor.can().undo()}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 7v6h6"></path>
          <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"></path>
        </svg>
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().redo().run()}
        className="p-2 rounded hover:bg-accent-foreground/10"
        title="Redo"
        disabled={!editor.can().redo()}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 7v6h-6"></path>
          <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13"></path>
        </svg>
      </button>
    </div>
  );
};

const Editor: React.FC<EditorProps> = ({ value, onChange, className = '' }) => {
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [html, setHtml] = useState('');

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({
        openOnClick: false,
      }),
      Placeholder.configure({
        placeholder: 'Write your content here...',
      }),
      Underline,
      TextStyle,
      Color,
    ],
    content: value,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
      setHtml(html);
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [editor, value]);

  return (
    <div className={`border rounded-lg overflow-hidden ${className}`}>
      <div className="flex justify-between items-center bg-accent p-2 border-b">
        <div className="font-medium">Editor</div>
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={() => setIsPreviewMode(false)}
            className={`p-2 rounded flex items-center gap-1 ${!isPreviewMode ? 'bg-primary/20' : 'hover:bg-accent-foreground/10'}`}
            title="Edit Mode"
          >
            <FiEdit className="w-4 h-4" />
            <span className="text-sm">Edit</span>
          </button>
          <button
            type="button"
            onClick={() => setIsPreviewMode(true)}
            className={`p-2 rounded flex items-center gap-1 ${isPreviewMode ? 'bg-primary/20' : 'hover:bg-accent-foreground/10'}`}
            title="Preview Mode"
          >
            <FiEye className="w-4 h-4" />
            <span className="text-sm">Preview</span>
          </button>
        </div>
      </div>

      {!isPreviewMode ? (
        <>
          <MenuBar editor={editor} />
          <EditorContent 
            editor={editor} 
            className="prose prose-sm dark:prose-invert max-w-none p-4 min-h-[250px] bg-background"
          />
        </>
      ) : (
        <div className="prose prose-sm dark:prose-invert max-w-none p-4 min-h-[250px] bg-background overflow-auto">
          {html ? (
            <div dangerouslySetInnerHTML={{ 
              __html: DOMPurify.sanitize(html) 
            }} />
          ) : (
            <p className="text-secondary italic">No content to preview</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Editor; 