"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Link from "@tiptap/extension-link"
import Image from "@tiptap/extension-image"
import Youtube from "@tiptap/extension-youtube"
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Quote, 
  Undo, 
  Redo,
  Link as LinkIcon,
  Image as ImageIcon,
  Youtube as YoutubeIcon
} from "lucide-react"
import { NButton } from "./ui/nbutton"
import { useState } from "react"

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
}

export function RichTextEditor({ content, onChange, placeholder }: RichTextEditorProps) {
  const [showLinkInput, setShowLinkInput] = useState(false)
  const [linkUrl, setLinkUrl] = useState("")

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-main underline cursor-pointer",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "max-w-full h-auto rounded-base border-2 border-border",
        },
      }),
      Youtube.configure({
        HTMLAttributes: {
          class: "w-full aspect-video rounded-base border-2 border-border",
        },
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[200px] p-4",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  if (!editor) {
    return null
  }

  const addLink = () => {
    if (linkUrl) {
      editor.chain().focus().setLink({ href: linkUrl }).run()
      setLinkUrl("")
      setShowLinkInput(false)
    }
  }

  const addImage = () => {
    const url = window.prompt("Enter image URL")
    if (url) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }

  const addYoutube = () => {
    const url = window.prompt("Enter YouTube URL")
    if (url) {
      editor.commands.setYoutubeVideo({ src: url })
    }
  }

  return (
    <div className="border-2 border-border rounded-base bg-white">
      <div className="flex flex-wrap gap-2 p-2 border-b-2 border-border bg-secondary-background">
        <NButton
          type="button"
          variant="neutral"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive("bold") ? "bg-main text-main-foreground" : ""}
        >
          <Bold className="w-4 h-4" />
        </NButton>
        <NButton
          type="button"
          variant="neutral"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive("italic") ? "bg-main text-main-foreground" : ""}
        >
          <Italic className="w-4 h-4" />
        </NButton>
        <NButton
          type="button"
          variant="neutral"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive("bulletList") ? "bg-main text-main-foreground" : ""}
        >
          <List className="w-4 h-4" />
        </NButton>
        <NButton
          type="button"
          variant="neutral"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive("orderedList") ? "bg-main text-main-foreground" : ""}
        >
          <ListOrdered className="w-4 h-4" />
        </NButton>
        <NButton
          type="button"
          variant="neutral"
          size="sm"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={editor.isActive("blockquote") ? "bg-main text-main-foreground" : ""}
        >
          <Quote className="w-4 h-4" />
        </NButton>

        <div className="w-px h-8 bg-border" />

        <NButton
          type="button"
          variant="neutral"
          size="sm"
          onClick={() => setShowLinkInput(!showLinkInput)}
        >
          <LinkIcon className="w-4 h-4" />
        </NButton>
        <NButton
          type="button"
          variant="neutral"
          size="sm"
          onClick={addImage}
        >
          <ImageIcon className="w-4 h-4" />
        </NButton>
        <NButton
          type="button"
          variant="neutral"
          size="sm"
          onClick={addYoutube}
        >
          <YoutubeIcon className="w-4 h-4" />
        </NButton>

        <div className="w-px h-8 bg-border" />

        <NButton
          type="button"
          variant="neutral"
          size="sm"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
        >
          <Undo className="w-4 h-4" />
        </NButton>
        <NButton
          type="button"
          variant="neutral"
          size="sm"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
        >
          <Redo className="w-4 h-4" />
        </NButton>
      </div>

      {showLinkInput && (
        <div className="p-2 border-b-2 border-border flex gap-2">
          <input
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="Enter URL..."
            className="flex-1 px-3 py-1 text-sm border-2 border-border rounded-base"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                addLink()
              }
            }}
          />
          <NButton type="button" variant="default" size="sm" onClick={addLink}>
            Add Link
          </NButton>
          <NButton
            type="button"
            variant="neutral"
            size="sm"
            onClick={() => {
              setShowLinkInput(false)
              setLinkUrl("")
            }}
          >
            Cancel
          </NButton>
        </div>
      )}

      <EditorContent editor={editor} className="prose max-w-none" />
    </div>
  )
}

