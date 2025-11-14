"use client"

import { useState, useEffect, useCallback, useRef } from "react"

interface UseSpeechToTextReturn {
  transcript: string
  isListening: boolean
  isSupported: boolean
  startListening: () => void
  stopListening: () => void
  resetTranscript: () => void
  error: string | null
}

export function useSpeechToText(): UseSpeechToTextReturn {
  const [transcript, setTranscript] = useState("")
  const [isListening, setIsListening] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const recognitionRef = useRef<any>(null)
  const finalTranscriptRef = useRef("")

  useEffect(() => {
    // Check if browser supports Web Speech API
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition

      if (SpeechRecognition) {
        setIsSupported(true)
        
        const recognition = new SpeechRecognition()
        
        // IMPROVED CONFIGURATION for better accuracy
        recognition.continuous = true
        recognition.interimResults = true
        recognition.lang = "en-US"
        
        // Additional settings for better accuracy
        recognition.maxAlternatives = 1 // Only get best result

        recognition.onresult = (event: any) => {
          let interimTranscript = ""
          let finalTranscript = ""

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcriptPiece = event.results[i][0].transcript
            const confidence = event.results[i][0].confidence || 0
            
            // Only use results with reasonable confidence
            if (confidence > 0.3) {
              if (event.results[i].isFinal) {
                finalTranscript += transcriptPiece + " "
              } else {
                interimTranscript += transcriptPiece
              }
            }
          }

          if (finalTranscript) {
            // Add basic punctuation (simple heuristics)
            const formatted = addBasicPunctuation(finalTranscript.trim())
            finalTranscriptRef.current += formatted + " "
            setTranscript(finalTranscriptRef.current.trim())
          } else {
            setTranscript(finalTranscriptRef.current + interimTranscript)
          }
        }

        recognition.onerror = (event: any) => {
          console.error("Speech recognition error:", event.error)
          
          // Better error messages
          let errorMessage = "Speech recognition error"
          switch (event.error) {
            case "no-speech":
              errorMessage = "No speech detected. Please try again."
              break
            case "audio-capture":
              errorMessage = "Microphone not found. Please check your microphone."
              break
            case "not-allowed":
              errorMessage = "Microphone permission denied. Please allow microphone access."
              break
            case "network":
              errorMessage = "Network error. Please check your connection."
              break
            case "aborted":
              // User stopped, not really an error
              return
            default:
              errorMessage = `Speech recognition error: ${event.error}`
          }
          
          setError(errorMessage)
          setIsListening(false)
        }

        recognition.onend = () => {
          setIsListening(false)
        }

        recognition.onstart = () => {
          setError(null)
        }

        recognitionRef.current = recognition
      } else {
        setIsSupported(false)
        setError("Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.")
      }
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop()
        } catch (e) {
          // Ignore errors on cleanup
        }
      }
    }
  }, [])

  // Helper function to add basic punctuation
  const addBasicPunctuation = useCallback((text: string): string => {
    if (!text) return text
    
    // Capitalize first letter
    text = text.charAt(0).toUpperCase() + text.slice(1)
    
    // Add period at end if it doesn't have punctuation
    if (!/[.!?]$/.test(text)) {
      text += "."
    }
    
    // Add commas before common conjunctions (simple heuristic)
    text = text.replace(/\s+and\s+/gi, ", and ")
    text = text.replace(/\s+but\s+/gi, ", but ")
    text = text.replace(/\s+or\s+/gi, ", or ")
    
    // Clean up multiple spaces
    text = text.replace(/\s+/g, " ")
    
    return text.trim()
  }, [])

  const startListening = useCallback(() => {
    if (recognitionRef.current && isSupported) {
      setError(null)
      try {
        // Reset transcript if starting fresh
        if (!isListening) {
          finalTranscriptRef.current = ""
        }
        recognitionRef.current.start()
        setIsListening(true)
      } catch (err: any) {
        console.error("Error starting recognition:", err)
        if (err.name === "InvalidStateError") {
          // Already running, try to stop and restart
          try {
            recognitionRef.current.stop()
            setTimeout(() => {
              recognitionRef.current.start()
              setIsListening(true)
            }, 100)
          } catch (e) {
            setError("Failed to start speech recognition. Please try again.")
          }
        } else {
          setError("Failed to start speech recognition")
        }
      }
    }
  }, [isSupported, isListening])

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
        setIsListening(false)
      } catch (err) {
        console.error("Error stopping recognition:", err)
        setIsListening(false)
      }
    }
  }, [])

  const resetTranscript = useCallback(() => {
    setTranscript("")
    finalTranscriptRef.current = ""
    setError(null)
  }, [])

  return {
    transcript,
    isListening,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
    error,
  }
}
