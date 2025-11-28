'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Underline from '@tiptap/extension-underline'
import Highlight from '@tiptap/extension-highlight'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Link from '@tiptap/extension-link'
import { useEffect } from 'react'

interface TiptapEditorProps {
  content: string
  onChange: (content: string) => void
  editable?: boolean
}

export default function TiptapEditor({
  content,
  onChange,
  editable = true,
}: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder: '开始写作...',
      }),
      Underline,
      Highlight.configure({
        multicolor: true,
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Link.configure({
        openOnClick: false,
      }),
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class:
          'prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none focus:outline-none min-h-[500px] px-6 py-4',
      },
    },
  })

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  if (!editor) {
    return null
  }

  return (
    <div className="border rounded-lg bg-white">
      {editable && (
        <div className="border-b p-2 flex flex-wrap gap-2 bg-gray-50">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`px-3 py-1 rounded text-sm ${
              editor.isActive('bold')
                ? 'bg-blue-500 text-white'
                : 'bg-white hover:bg-gray-100'
            }`}
          >
            <strong>B</strong>
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`px-3 py-1 rounded text-sm ${
              editor.isActive('italic')
                ? 'bg-blue-500 text-white'
                : 'bg-white hover:bg-gray-100'
            }`}
          >
            <em>I</em>
          </button>
          <button
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`px-3 py-1 rounded text-sm ${
              editor.isActive('underline')
                ? 'bg-blue-500 text-white'
                : 'bg-white hover:bg-gray-100'
            }`}
          >
            <u>U</u>
          </button>
          <button
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`px-3 py-1 rounded text-sm ${
              editor.isActive('strike')
                ? 'bg-blue-500 text-white'
                : 'bg-white hover:bg-gray-100'
            }`}
          >
            <s>S</s>
          </button>
          <div className="w-px bg-gray-300" />
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`px-3 py-1 rounded text-sm ${
              editor.isActive('heading', { level: 1 })
                ? 'bg-blue-500 text-white'
                : 'bg-white hover:bg-gray-100'
            }`}
          >
            H1
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`px-3 py-1 rounded text-sm ${
              editor.isActive('heading', { level: 2 })
                ? 'bg-blue-500 text-white'
                : 'bg-white hover:bg-gray-100'
            }`}
          >
            H2
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`px-3 py-1 rounded text-sm ${
              editor.isActive('heading', { level: 3 })
                ? 'bg-blue-500 text-white'
                : 'bg-white hover:bg-gray-100'
            }`}
          >
            H3
          </button>
          <div className="w-px bg-gray-300" />
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`px-3 py-1 rounded text-sm ${
              editor.isActive('bulletList')
                ? 'bg-blue-500 text-white'
                : 'bg-white hover:bg-gray-100'
            }`}
          >
            • 列表
          </button>
          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`px-3 py-1 rounded text-sm ${
              editor.isActive('orderedList')
                ? 'bg-blue-500 text-white'
                : 'bg-white hover:bg-gray-100'
            }`}
          >
            1. 列表
          </button>
          <button
            onClick={() => editor.chain().focus().toggleTaskList().run()}
            className={`px-3 py-1 rounded text-sm ${
              editor.isActive('taskList')
                ? 'bg-blue-500 text-white'
                : 'bg-white hover:bg-gray-100'
            }`}
          >
            ✓ 任务
          </button>
          <div className="w-px bg-gray-300" />
          <button
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            className={`px-3 py-1 rounded text-sm ${
              editor.isActive('highlight')
                ? 'bg-yellow-300'
                : 'bg-white hover:bg-gray-100'
            }`}
          >
            高亮
          </button>
          <button
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={`px-3 py-1 rounded text-sm ${
              editor.isActive('codeBlock')
                ? 'bg-blue-500 text-white'
                : 'bg-white hover:bg-gray-100'
            }`}
          >
            {'</>'}
          </button>
        </div>
      )}
      <EditorContent editor={editor} />
    </div>
  )
}
