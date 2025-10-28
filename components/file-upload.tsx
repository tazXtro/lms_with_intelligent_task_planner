"use client"

import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { Upload, X, File, Image as ImageIcon, Video } from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import { NButton } from "./ui/nbutton"

interface FileUploadProps {
  bucket: "course-thumbnails" | "course-videos" | "course-materials"
  accept?: Record<string, string[]>
  maxSize?: number
  onUploadComplete: (url: string) => void
  existingUrl?: string
  label?: string
}

export function FileUpload({
  bucket,
  accept,
  maxSize = 10 * 1024 * 1024, // 10MB default
  onUploadComplete,
  existingUrl,
  label = "Upload file",
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadedUrl, setUploadedUrl] = useState<string | undefined>(existingUrl)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)

  const supabase = createClient()

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return

      const file = acceptedFiles[0]
      setUploading(true)
      setError(null)
      setProgress(0)

      try {
        const fileExt = file.name.split(".").pop()
        const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`
        const filePath = `${fileName}`

        // Simulate progress (since Supabase storage doesn't provide real-time progress)
        const progressInterval = setInterval(() => {
          setProgress((prev) => Math.min(prev + 10, 90))
        }, 200)

        const { data, error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false,
          })

        clearInterval(progressInterval)
        setProgress(100)

        if (uploadError) throw uploadError

        const {
          data: { publicUrl },
        } = supabase.storage.from(bucket).getPublicUrl(data.path)

        setUploadedUrl(publicUrl)
        onUploadComplete(publicUrl)
      } catch (err) {
        console.error("Upload error:", err)
        setError(err instanceof Error ? err.message : "Upload failed")
      } finally {
        setUploading(false)
        setTimeout(() => setProgress(0), 1000)
      }
    },
    [bucket, onUploadComplete, supabase.storage]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple: false,
  })

  const removeFile = async () => {
    if (!uploadedUrl) return

    try {
      const path = uploadedUrl.split("/").pop()
      if (path) {
        await supabase.storage.from(bucket).remove([path])
      }
      setUploadedUrl(undefined)
      onUploadComplete("")
    } catch (err) {
      console.error("Remove error:", err)
    }
  }

  const getFileIcon = () => {
    if (bucket === "course-thumbnails") return <ImageIcon className="w-8 h-8" />
    if (bucket === "course-videos") return <Video className="w-8 h-8" />
    return <File className="w-8 h-8" />
  }

  if (uploadedUrl) {
    return (
      <div className="relative border-2 border-border rounded-base p-4 bg-secondary-background">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {bucket === "course-thumbnails" && (
              <img
                src={uploadedUrl}
                alt="Uploaded"
                className="w-20 h-20 object-cover rounded-base border-2 border-border"
              />
            )}
            {bucket === "course-videos" && (
              <div className="w-20 h-20 bg-main/10 rounded-base border-2 border-border flex items-center justify-center">
                <Video className="w-8 h-8 text-foreground/50" />
              </div>
            )}
            <div>
              <p className="font-heading text-sm">File uploaded successfully</p>
              <p className="text-xs text-foreground/70 font-base truncate max-w-[200px]">
                {uploadedUrl.split("/").pop()}
              </p>
            </div>
          </div>
          <NButton type="button" variant="neutral" size="sm" onClick={removeFile}>
            <X className="w-4 h-4" />
          </NButton>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-base p-8 text-center cursor-pointer transition-all ${
          isDragActive
            ? "border-main bg-main/5"
            : "border-border bg-secondary-background hover:bg-main/5"
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-3">
          {uploading ? (
            <>
              <Upload className="w-8 h-8 text-foreground/50 animate-pulse" />
              <p className="font-heading text-sm">Uploading... {progress}%</p>
              <div className="w-full max-w-xs h-2 bg-border rounded-full overflow-hidden">
                <div
                  className="h-full bg-main transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </>
          ) : (
            <>
              {getFileIcon()}
              <div>
                <p className="font-heading text-sm mb-1">
                  {isDragActive ? "Drop file here" : label}
                </p>
                <p className="text-xs text-foreground/70 font-base">
                  {isDragActive
                    ? "Release to upload"
                    : "Drag & drop or click to browse"}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
      {error && (
        <p className="text-sm text-destructive mt-2 font-base">{error}</p>
      )}
    </div>
  )
}

