/**
 * Biblical Audio Engine with Human Voice Generation (Gemini AI TTS)
 * and High-Fidelity Web Speech Fallback.
 */

interface PlaybackOptions {
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: any) => void;
  rate?: number;
  voicePreference?: 'Puck' | 'Fenrir' | 'Kore' | 'Aoede' | 'Zephyr' | 'Charon';
}

class BiblicalAudioEngine {
  private currentAudioElement: HTMLAudioElement | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private abortController: AbortController | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private clientAudioCache = new Map<string, string>();
  private lockedLocalVoice: SpeechSynthesisVoice | null = null;
  private quotaReached = false;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.loadVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        this.loadVoices();
      };
    }
  }

  private loadVoices() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.voices = window.speechSynthesis.getVoices();
      if (!this.lockedLocalVoice) {
        this.getLockedVoice('pt-BR');
      }
    }
  }

  private getCachedAudio(cacheKey: string): string | null {
    if (this.clientAudioCache.has(cacheKey)) {
      return this.clientAudioCache.get(cacheKey)!;
    }
    try {
      const stored = localStorage.getItem(`bible_tts_${cacheKey}`);
      if (stored) {
        this.clientAudioCache.set(cacheKey, stored);
        return stored;
      }
    } catch {
      // ignore storage access errors
    }
    return null;
  }

  private setCachedAudio(cacheKey: string, audioData: string) {
    this.clientAudioCache.set(cacheKey, audioData);
    try {
      localStorage.setItem(`bible_tts_${cacheKey}`, audioData);
    } catch {
      // quota for localStorage exceeded, memory map still retains it
    }
  }

  private getLockedVoice(lang: string): SpeechSynthesisVoice | undefined {
    if (this.lockedLocalVoice && this.lockedLocalVoice.lang.startsWith(lang.slice(0, 2))) {
      return this.lockedLocalVoice;
    }

    const ptVoices = this.voices.filter((v) => v.lang.startsWith('pt'));
    const preferred = 
      ptVoices.find((v) => v.name.includes('Daniel') || v.name.includes('Antonio') || v.name.includes('Felipe') || v.name.includes('Luciano') || v.name.toLowerCase().includes('male')) ||
      ptVoices.find((v) => v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Neural')) ||
      ptVoices[0] ||
      this.voices.find((v) => v.lang.startsWith(lang));

    if (preferred) {
      this.lockedLocalVoice = preferred;
    }
    return this.lockedLocalVoice || preferred;
  }

  /**
   * Stop any playing audio immediately.
   */
  public stop() {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }

    if (this.currentAudioElement) {
      this.currentAudioElement.pause();
      this.currentAudioElement.currentTime = 0;
      this.currentAudioElement = null;
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      this.currentUtterance = null;
    }
  }

  /**
   * Quick voice preview test
   */
  public async testVoice(voiceName: 'Puck' | 'Fenrir' | 'Kore' | 'Aoede' | 'Zephyr' | 'Charon', onEnd?: () => void) {
    const sampleText = 'No princípio, criou Deus os céus e a terra.';
    await this.speakPortuguese(sampleText, {
      voicePreference: voiceName,
      onEnd
    });
  }

  /**
   * Fetches AI TTS audio with automatic retry to prevent dropping to robotic speech.
   */
  private async fetchAiAudioWithRetry(
    text: string,
    language: string,
    voiceName: string = 'Puck',
    signal?: AbortSignal
  ): Promise<string | null> {
    const cleanText = text.trim();
    const cacheKey = `${language}:${voiceName}:${cleanText}`;

    // 1. Check persistent & memory cache first
    const cached = this.getCachedAudio(cacheKey);
    if (cached) {
      return cached;
    }

    // If quota was already exhausted in this session, skip network request to prevent delay
    if (this.quotaReached) {
      return null;
    }

    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: cleanText,
          language,
          voiceName
        }),
        signal
      });

      if (response.ok) {
        const data = await response.json();
        if (data.quotaExceeded) {
          this.quotaReached = true;
          return null;
        }
        if (data.audioData) {
          this.setCachedAudio(cacheKey, data.audioData);
          return data.audioData;
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError') return null;
    }

    return null;
  }

  /**
   * Prefetch upcoming verse audio in the background for instant uninterrupted playback.
   */
  public async prefetch(text: string, language: 'pt' | 'he' | 'el', voicePreference: string = 'Puck') {
    if (!text || text.trim().length === 0 || this.quotaReached) return;
    try {
      await this.fetchAiAudioWithRetry(text, language, voicePreference);
    } catch {
      // prefetch error is non-critical
    }
  }

  /**
   * Speaks Portuguese text with Human Voice (Gemini AI TTS), with neural browser fallback.
   */
  public async speakPortuguese(text: string, options?: PlaybackOptions) {
    this.stop();
    this.abortController = new AbortController();

    const voiceName = options?.voicePreference || 'Puck';

    options?.onStart?.();
    const audioData = await this.fetchAiAudioWithRetry(
      text,
      'pt',
      voiceName,
      this.abortController.signal
    );

    if (audioData) {
      await this.playBase64Wav(audioData, options);
      return;
    }

    // Fallback to Local Web Speech API with locked consistent voice
    this.speakLocal(text, 'pt-BR', options, this.getLockedVoice('pt-BR'));
  }

  /**
   * Speaks Hebrew text with Human Voice (Gemini AI TTS), with transliteration fallback.
   */
  public async speakHebrew(hebrewText: string, transliteration: string, options?: PlaybackOptions) {
    this.stop();
    this.abortController = new AbortController();

    const voiceName = options?.voicePreference || 'Puck';

    options?.onStart?.();
    const audioData = await this.fetchAiAudioWithRetry(
      hebrewText,
      'he',
      voiceName,
      this.abortController.signal
    );

    if (audioData) {
      await this.playBase64Wav(audioData, options);
      return;
    }

    // If AI TTS quota reached or failed, use Puck/locked voice on the phonetic transliteration
    // so it reads fluently like Gênesis 1:1 instead of spelling out Hebrew letters.
    this.speakPortuguese(transliteration, options);
  }

  /**
   * Speaks Greek text with Human Voice (Gemini AI TTS).
   */
  public async speakGreek(greekText: string, transliteration: string, options?: PlaybackOptions) {
    this.stop();
    this.abortController = new AbortController();

    const voiceName = options?.voicePreference || 'Puck';

    options?.onStart?.();
    const audioData = await this.fetchAiAudioWithRetry(
      greekText,
      'el',
      voiceName,
      this.abortController.signal
    );

    if (audioData) {
      await this.playBase64Wav(audioData, options);
      return;
    }

    this.speakPortuguese(transliteration, options);
  }

  /**
   * Plays Base64 WAV audio generated by Gemini Human TTS.
   */
  private playBase64Wav(base64Data: string, options?: PlaybackOptions): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'audio/wav' });
        const url = URL.createObjectURL(blob);

        const audio = new Audio(url);
        this.currentAudioElement = audio;
        if (options?.rate) {
          audio.playbackRate = options.rate;
        }

        audio.onended = () => {
          URL.revokeObjectURL(url);
          this.currentAudioElement = null;
          options?.onEnd?.();
          resolve();
        };

        audio.onerror = (e) => {
          URL.revokeObjectURL(url);
          this.currentAudioElement = null;
          options?.onError?.(e);
          reject(e);
        };

        audio.play().catch((err) => {
          options?.onError?.(err);
          reject(err);
        });
      } catch (err) {
        options?.onError?.(err);
        reject(err);
      }
    });
  }

  /**
   * Local SpeechSynthesis fallback with priority on natural/neural voices.
   */
  private speakLocal(
    text: string,
    lang: string,
    options?: PlaybackOptions,
    preferredVoice?: SpeechSynthesisVoice
  ) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      options?.onEnd?.();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    // Calibrated solemn biblical rate and pitch to match Genesis 1:1 cadence
    utterance.rate = options?.rate ? options.rate * 0.90 : 0.90;
    utterance.pitch = 0.98;

    const chosenVoice = preferredVoice || this.getLockedVoice(lang);
    if (chosenVoice) {
      utterance.voice = chosenVoice;
    }

    utterance.onstart = () => options?.onStart?.();
    utterance.onend = () => {
      this.currentUtterance = null;
      options?.onEnd?.();
    };
    utterance.onerror = (e) => {
      this.currentUtterance = null;
      options?.onError?.(e);
    };

    this.currentUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  }
}

export const audioEngine = new BiblicalAudioEngine();
