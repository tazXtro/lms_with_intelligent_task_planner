import { createWorker, PSM } from 'tesseract.js'

/**
 * Clean and format OCR text output
 */
function cleanOCRText(text: string): string {
  if (!text) return ''

  let cleaned = text

  // Remove common OCR artifacts and noise
  // Remove single character lines that are likely artifacts (like "(3", "(0)")
  cleaned = cleaned.replace(/^\([0-9]\)\s*$/gm, '')
  cleaned = cleaned.replace(/^[\(\)0-9]{1,3}\s*$/gm, '')
  
  // Fix common OCR errors
  cleaned = cleaned.replace(/\bspelloound\b/gi, 'spellbound')
  cleaned = cleaned.replace(/\bar spelloound\b/gi, 'spellbound')
  
  // Normalize whitespace - replace multiple spaces with single space
  cleaned = cleaned.replace(/[ \t]+/g, ' ')
  
  // Normalize line breaks - remove excessive blank lines (more than 2 consecutive)
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n')
  
  // Clean up lines that are mostly special characters or very short noise
  cleaned = cleaned.split('\n')
    .map(line => line.trim())
    .filter(line => {
      // Remove lines that are mostly special characters or very short noise
      if (line.length <= 2 && /^[^a-zA-Z0-9]*$/.test(line)) return false
      // Remove lines that are just single characters or numbers
      if (line.length === 1 && /^[^a-zA-Z]$/.test(line)) return false
      return true
    })
    .join('\n')
  
  // Remove leading/trailing whitespace from each line
  cleaned = cleaned.split('\n')
    .map(line => line.trim())
    .join('\n')
  
  // Final cleanup - remove excessive blank lines again
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n')
  
  return cleaned.trim()
}

/**
 * Extract text from an image using OCR with improved settings
 */
export async function extractTextFromImage(file: File): Promise<string> {
  try {
    const worker = await createWorker('eng')
    
    // Configure OCR for better text recognition
    // PSM 6 = Assume a single uniform block of text (good for structured documents)
    await worker.setParameters({
      tessedit_pageseg_mode: PSM.SINGLE_BLOCK, // Uniform block of text
    })
    
    const { data: { text } } = await worker.recognize(file)
    await worker.terminate()
    
    // Clean and format the extracted text
    const cleanedText = cleanOCRText(text)
    
    return cleanedText
  } catch (error) {
    console.error('Error extracting text from image:', error)
    throw new Error('Failed to extract text from image. Please ensure the image is clear and readable.')
  }
}

/**
 * Extract text from an image file
 */
export async function extractTextFromFile(file: File): Promise<string> {
  const fileType = file.type
  const fileName = file.name.toLowerCase()

  if (fileType.startsWith('image/') || /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(fileName)) {
    return await extractTextFromImage(file)
  } else {
    throw new Error('Unsupported file type. Please upload an image file (JPG, PNG, GIF, BMP, WEBP).')
  }
}

/**
 * Check if a file is an image
 */
export function isImage(file: File): boolean {
  return file.type.startsWith('image/') || /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(file.name)
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

