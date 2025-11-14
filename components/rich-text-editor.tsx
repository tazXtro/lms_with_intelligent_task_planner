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
import { useState, useEffect } from "react"

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
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
        blockquote: {
          HTMLAttributes: {
            class: "border-l-4 border-main pl-4 italic my-4",
          },
        },
      }),
      Link.configure({
        openOnClick: false,
        protocols: ["http", "https", "mailto"],
        HTMLAttributes: {
          class: "text-main underline cursor-pointer hover:text-main/80",
          target: "_blank",
          rel: "noopener noreferrer",
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

  // Update editor content when prop changes
  useEffect(() => {
    if (editor) {
      const currentHTML = editor.getHTML()
      // Only update if content actually changed (handle both empty strings and HTML)
      if (content !== currentHTML) {
        editor.commands.setContent(content || "")
      }
    }
  }, [content, editor])

  if (!editor) {
    return null
  }

  const addLink = () => {
    if (linkUrl) {
      // Ensure URL has protocol
      let url = linkUrl.trim()
      if (!url.match(/^https?:\/\//i) && !url.match(/^mailto:/i)) {
        url = `https://${url}`
      }

      const { from, to } = editor.state.selection
      const selectedText = editor.state.doc.textBetween(from, to)

      if (selectedText) {
        // If text is selected, make it a link
        editor.chain().focus().setLink({ href: url }).run()
      } else {
        // If no text is selected, insert the URL as a link
        editor.chain().focus().insertContent(`<a href="${url}">${url}</a>`).run()
      }
      
      setLinkUrl("")
      setShowLinkInput(false)
    }
  }

  const removeLink = () => {
    editor.chain().focus().unsetLink().run()
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
          onClick={() => {
            if (editor.isActive("link")) {
              // If link is active, remove it or show input to edit
              const currentLink = editor.getAttributes("link")
              if (currentLink.href) {
                setLinkUrl(currentLink.href)
                setShowLinkInput(true)
              } else {
                removeLink()
              }
            } else {
              // Show input to add new link
              const { from, to } = editor.state.selection
              const selectedText = editor.state.doc.textBetween(from, to)
              if (selectedText) {
                setLinkUrl("")
              }
              setShowLinkInput(!showLinkInput)
            }
          }}
          className={editor.isActive("link") ? "bg-main text-main-foreground" : ""}
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

      <EditorContent 
        editor={editor} 
        className="prose max-w-none" 
      />
    </div>
  )
}

