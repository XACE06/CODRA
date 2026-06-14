import { useMemo, useRef } from "react";
import type { CodraStatus } from "../lib/types";

interface UseSpeechInputOptions {
  onStatusChange: (status: CodraStatus) => void;
  onResult: (text: string) => void;
  onError: (message: string) => void;
}

interface SpeechRecognitionConstructor {
  new(): SpeechRecognition;
}

interface SpeechRecognition extends EventTarget {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

interface SpeechRecognitionEvent {
  results: {
    length: number;
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
    };
  };
}

interface SpeechRecognitionErrorEvent {
  error?: string;
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

export function useSpeechInput({ onStatusChange, onResult, onError }: UseSpeechInputOptions) {
  const Recognition = useMemo(() => window.SpeechRecognition ?? window.webkitSpeechRecognition, []);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isListeningRef = useRef(false);
  const supported = typeof Recognition === "function";

  const start = async () => {
    if (typeof Recognition !== "function") {
      onStatusChange("error");
      onError("This browser cannot turn voice into text. Try Chrome or Safari.");
      return;
    }

    if (isListeningRef.current && recognitionRef.current) {
      recognitionRef.current.stop();
      return;
    }

    try {
      if (navigator.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((track) => track.stop());
      }

      const recognition = new Recognition();
      recognitionRef.current = recognition;
      recognition.lang = "zh-CN";
      recognition.interimResults = false;
      recognition.continuous = false;

      let hasResult = false;
      let hadError = false;

      recognition.onstart = () => {
        isListeningRef.current = true;
        onStatusChange("listening");
        onError("");
      };
      recognition.onresult = (event) => {
        const lastResult = event.results[event.results.length - 1];
        const transcript = lastResult?.[0]?.transcript?.trim() ?? "";
        if (transcript) {
          hasResult = true;
          onResult(transcript);
          recognition.stop();
        }
      };
      recognition.onerror = (event) => {
        hadError = true;
        isListeningRef.current = false;
        onStatusChange("error");
        if (event.error === "not-allowed") {
          onError("Microphone permission was blocked.");
        } else if (event.error === "audio-capture") {
          onError("I couldn't find an active microphone.");
        } else if (event.error === "no-speech") {
          onError("I didn't catch your voice. Try again.");
        } else {
          onError("I couldn't hear that clearly.");
        }
      };
      recognition.onend = () => {
        recognitionRef.current = null;
        isListeningRef.current = false;
        if (hadError) return;
        if (!hasResult && !hadError) {
          onStatusChange("idle");
          onError("I didn't catch your voice. Try again.");
          return;
        }
        onStatusChange("idle");
      };

      recognition.start();
    } catch (error) {
      recognitionRef.current = null;
      isListeningRef.current = false;
      onStatusChange("error");
      if (error instanceof DOMException && error.name === "NotAllowedError") {
        onError("Microphone permission was blocked.");
        return;
      }
      onError("I couldn't open the microphone.");
    }
  };

  return { supported, start };
}
