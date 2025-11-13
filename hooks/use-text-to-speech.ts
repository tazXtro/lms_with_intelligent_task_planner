"use client"

import { useState, useEffect, useCallback, useRef } from "react"

interface UseTextToSpeechReturn {
  speak: (text: string, options?: SpeechOptions) => void
  cancel: () => void
  pause: () => void
  resume: () => void
  isSpeaking: boolean
  isPaused: boolean
  isSupported: boolean
  voices: SpeechSynthesisVoice[]
  error: string | null
  voicesLoaded: boolean
}

interface SpeechOptions {
  voice?: SpeechSynthesisVoice
  rate?: number
  pitch?: number
  volume?: number
}

export function useTextToSpeech(): UseTextToSpeechReturn {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [voicesLoaded, setVoicesLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  useEffect(() => {
    // Check if browser supports Web Speech Synthesis API
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      setIsSupported(true)
      
      // Load voices
      const loadVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices()
        if (availableVoices.length > 0) {
          setVoices(availableVoices)
          setVoicesLoaded(true)
        }
      }

      // Try loading immediately
      loadVoices()
      
      // Chrome loads voices asynchronously
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices
      }

      // Fallback: Keep trying to load voices for up to 2 seconds
      const voiceCheckInterval = setInterval(() => {
        const availableVoices = window.speechSynthesis.getVoices()
        if (availableVoices.length > 0) {
          setVoices(availableVoices)
          setVoicesLoaded(true)
          clearInterval(voiceCheckInterval)
        }
      }, 100)

      const timeoutId = setTimeout(() => clearInterval(voiceCheckInterval), 2000)

      // Cleanup function
      return () => {
        clearInterval(voiceCheckInterval)
        clearTimeout(timeoutId)
        if (window.speechSynthesis) {
          window.speechSynthesis.cancel()
        }
      }
    } else {
      setIsSupported(false)
      setError("Text-to-speech is not supported in this browser")
    }
  }, [])

  const speak = useCallback(
    (text: string, options?: SpeechOptions) => {
      if (!isSupported) {
        setError("Text-to-speech is not supported")
        return
      }

      const performSpeech = () => {
        // Cancel any ongoing speech
        window.speechSynthesis.cancel()

        const utterance = new SpeechSynthesisUtterance(text)
        
        // Apply options
        if (options?.voice) {
          utterance.voice = options.voice
        } else {
          // Ensure voices are loaded (fix for async voice loading)
          const currentVoices = window.speechSynthesis.getVoices()
          
          // Try to select a good default English voice
          const englishVoice = currentVoices.find(
            (voice) =>
              voice.lang.startsWith("en") &&
              (voice.name.includes("Female") || voice.name.includes("Google") || voice.name.includes("Natural"))
          ) || currentVoices.find((voice) => voice.lang.startsWith("en")) // Fallback to any English voice
          
          if (englishVoice) {
            utterance.voice = englishVoice
          }
        }
        
        utterance.rate = options?.rate ?? 0.9 // Slightly slower for clarity
        utterance.pitch = options?.pitch ?? 1.0
        utterance.volume = options?.volume ?? 1.0

      utterance.onstart = () => {
        setIsSpeaking(true)
        setIsPaused(false)
        setError(null)
      }

      utterance.onend = () => {
        setIsSpeaking(false)
        setIsPaused(false)
        utteranceRef.current = null
      }

        utterance.onerror = (event) => {
          console.error("Speech synthesis error:", event)
          setError(`Speech error: ${event.error}`)
          setIsSpeaking(false)
          setIsPaused(false)
          utteranceRef.current = null
        }

        utterance.onpause = () => {
          setIsPaused(true)
        }

        utterance.onresume = () => {
          setIsPaused(false)
        }

        utteranceRef.current = utterance
        window.speechSynthesis.speak(utterance)
      }

      // Wait for voices to be loaded before speaking
      if (voicesLoaded) {
        performSpeech()
      } else {
        // Wait up to 2 seconds for voices to load
        let attempts = 0
        const maxAttempts = 20
        const checkInterval = setInterval(() => {
          attempts++
          const currentVoices = window.speechSynthesis.getVoices()
          if (currentVoices.length > 0) {
            clearInterval(checkInterval)
            performSpeech()
          } else if (attempts >= maxAttempts) {
            clearInterval(checkInterval)
            performSpeech() // Speak anyway, browser will use default voice
          }
        }, 100)
      }
    },
    [isSupported, voicesLoaded]
  )

  const cancel = useCallback(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
      setIsPaused(false)
      utteranceRef.current = null
    }
  }, [])

  const pause = useCallback(() => {
    if (window.speechSynthesis && isSpeaking) {
      window.speechSynthesis.pause()
      setIsPaused(true)
    }
  }, [isSpeaking])

  const resume = useCallback(() => {
    if (window.speechSynthesis && isPaused) {
      window.speechSynthesis.resume()
      setIsPaused(false)
    }
  }, [isPaused])

  return {
    speak,
    cancel,
    pause,
    resume,
    isSpeaking,
    isPaused,
    isSupported,
    voices,
    error,
    voicesLoaded,
  }
}

