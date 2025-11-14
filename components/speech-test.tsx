"use client"

import { useSpeechToText } from "@/hooks/use-speech-to-text"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mic, MicOff, Trash2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function SpeechTest() {
  const {
    transcript,
    isListening,
    isSupported,
    error,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechToText()

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Speech-to-Text Test</CardTitle>
        <CardDescription>
          Test your improved Web Speech API integration
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Browser Support Check */}
        {!isSupported && (
          <Alert variant="destructive">
            <AlertDescription>
              Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.
            </AlertDescription>
          </Alert>
        )}

        {/* Control Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={startListening}
            disabled={isListening || !isSupported}
            className="flex-1"
          >
            {isListening ? (
              <>
                <Mic className="w-4 h-4 mr-2 animate-pulse text-red-500" />
                Listening...
              </>
            ) : (
              <>
                <Mic className="w-4 h-4 mr-2" />
                Start Recording
              </>
            )}
          </Button>
          
          <Button
            onClick={stopListening}
            disabled={!isListening}
            variant="destructive"
            className="flex-1"
          >
            <MicOff className="w-4 h-4 mr-2" />
            Stop Recording
          </Button>
          
          <Button 
            onClick={resetTranscript} 
            variant="outline"
            disabled={!transcript}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>

        {/* Status Messages */}
        {isListening && (
          <Alert className="bg-blue-50 border-blue-200">
            <Mic className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              Recording... Speak clearly into your microphone. Transcription appears in real-time.
            </AlertDescription>
          </Alert>
        )}

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Transcript Display */}
        {transcript && (
          <div className="space-y-2">
            <div className="p-4 bg-muted rounded-lg border">
              <p className="text-sm font-medium mb-2 text-muted-foreground">
                Transcript:
              </p>
              <p className="text-lg leading-relaxed">{transcript}</p>
            </div>

            <div className="text-xs text-muted-foreground">
              <p>Character count: {transcript.length}</p>
              <p>Word count: {transcript.split(/\s+/).filter(Boolean).length}</p>
            </div>
          </div>
        )}

        {/* Instructions */}
        {!transcript && !isListening && isSupported && (
          <div className="p-4 bg-muted/50 rounded-lg border border-dashed">
            <p className="text-sm text-muted-foreground text-center">
              Click "Start Recording" and speak into your microphone.
              <br />
              Transcription appears in real-time. Click "Stop Recording" when finished.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

