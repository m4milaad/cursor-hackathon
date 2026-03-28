let utter: SpeechSynthesisUtterance | null = null

export function stopSpeaking(): void {
  speechSynthesis.cancel()
  utter = null
}

/**
 * Browser TTS for demos. Swap for ElevenLabs / Google Cloud TTS with keys.
 */
export function speakText(text: string, lang = 'hi-IN'): Promise<void> {
  return new Promise((resolve) => {
    stopSpeaking()
    if (!text || !window.speechSynthesis) {
      resolve()
      return
    }
    utter = new SpeechSynthesisUtterance(text)
    utter.lang = lang
    utter.rate = 0.92
    utter.onend = () => resolve()
    utter.onerror = () => resolve()
    speechSynthesis.speak(utter)
  })
}
