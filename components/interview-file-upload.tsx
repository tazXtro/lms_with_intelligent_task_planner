"use client"

import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { Upload, X, Image as ImageIcon, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { NButton } from "./ui/nbutton"
import { extractTextFromFile, isImage, formatFileSize } from "@/utils/file-parser"

interface InterviewFileUploadProps {
  onTextExtracted: (text: string, fileName: string) => void
  onError: (error: string) => void
  maxSize?: number
}

interface UploadedFile {
  file: File
  extractedText: string | null
  isExtracting: boolean
  error: string | null
}

export function InterviewFileUpload({
  onTextExtracted,
  onError,
  maxSize = 10 * 1024 * 1024, // 10MB default
}: InterviewFileUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isExtracting, setIsExtracting] = useState(false)

  const extractText = useCallback(async (file: File) => {
    try {
      setIsExtracting(true)
      const extractedText = await extractTextFromFile(file)
      
      setUploadedFiles((prev) =>
        prev.map((item) =>
          item.file === file
            ? { ...item, extractedText, isExtracting: false, error: null }
            : item
        )
      )

      // Call the callback with extracted text
      onTextExtracted(extractedText, file.name)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to extract text"
      setUploadedFiles((prev) =>
        prev.map((item) =>
          item.file === file
            ? { ...item, isExtracting: false, error: errorMessage }
            : item
        )
      )
      onError(errorMessage)
    } finally {
      setIsExtracting(false)
    }
  }, [onTextExtracted, onError])

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return

      const newFiles: UploadedFile[] = acceptedFiles.map((file) => ({
        file,
        extractedText: null,
        isExtracting: true,
        error: null,
      }))

      setUploadedFiles((prev) => [...prev, ...newFiles])

      // Extract text from all files
      for (const file of acceptedFiles) {
        await extractText(file)
      }
    },
    [extractText]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp"],
    },
    maxSize,
    multiple: true,
  })

  const removeFile = (fileToRemove: File) => {
    setUploadedFiles((prev) => prev.filter((item) => item.file !== fileToRemove))
  }

  const getFileIcon = () => {
    return <ImageIcon className="w-5 h-5 text-blue-500" />
  }

  return (
    <div className="space-y-3">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-base p-6 cursor-pointer transition-colors
          ${
            isDragActive
              ? "border-main bg-main/5"
              : "border-border hover:border-main/50 bg-background"
          }
        `}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center gap-3 text-center">
          <div className="w-12 h-12 bg-main/10 rounded-base flex items-center justify-center">
            <Upload className="w-6 h-6 text-main" />
          </div>
          <div>
            <p className="font-heading text-sm mb-1">
              {isDragActive
                ? "Drop images here"
                : "Upload Image"}
            </p>
            <p className="text-xs text-foreground/70 font-base">
              Drag and drop images here, or click to select
            </p>
            <p className="text-xs text-foreground/50 font-base mt-1">
              Supports images (JPG, PNG, GIF, BMP, WEBP). Max {formatFileSize(maxSize)} per file.
            </p>
          </div>
        </div>
      </div>

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          {uploadedFiles.map((uploadedFile) => (
            <div
              key={uploadedFile.file.name}
              className="p-3 border-2 border-border rounded-base bg-secondary-background flex items-start gap-3"
            >
              <div className="flex-shrink-0 mt-0.5">
                {getFileIcon()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-heading text-sm truncate">
                      {uploadedFile.file.name}
                    </p>
                    <p className="text-xs text-foreground/60 font-base">
                      {formatFileSize(uploadedFile.file.size)}
                    </p>
                    {uploadedFile.isExtracting && (
                      <div className="flex items-center gap-2 mt-2">
                        <Loader2 className="w-3 h-3 animate-spin text-main" />
                        <span className="text-xs text-foreground/70 font-base">
                          Extracting text...
                        </span>
                      </div>
                    )}
                    {uploadedFile.error && (
                      <div className="flex items-start gap-2 mt-2">
                        <AlertCircle className="w-3 h-3 text-destructive flex-shrink-0 mt-0.5" />
                        <span className="text-xs text-destructive font-base">
                          {uploadedFile.error}
                        </span>
                      </div>
                    )}
                    {uploadedFile.extractedText && !uploadedFile.error && (
                      <div className="flex items-center gap-2 mt-2">
                        <CheckCircle className="w-3 h-3 text-success" />
                        <span className="text-xs text-success font-base">
                          Text extracted successfully ({uploadedFile.extractedText.length} characters)
                        </span>
                      </div>
                    )}
                  </div>
                  <NButton
                    type="button"
                    variant="neutral"
                    size="sm"
                    onClick={() => removeFile(uploadedFile.file)}
                    className="flex-shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </NButton>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isExtracting && (
        <div className="p-3 bg-main/5 border-2 border-main/20 rounded-base">
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-main" />
            <p className="text-sm font-base text-foreground/80">
              Processing images... This may take a moment for large images.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

