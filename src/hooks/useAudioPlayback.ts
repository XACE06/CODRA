import { useEffect, useRef, useState } from "react";
import { requestTtsAudio } from "../lib/apiClient";
import type { CodraStatus } from "../lib/types";

const SILENT_AUDIO_DATA_URL = "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YQAAAAA=";
const debugPlayback = import.meta.env.DEV;

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}

interface UseAudioPlaybackOptions {
  useMockTts: boolean;
  onStatusChange: (status: CodraStatus) => void;
  onError: (message: string) => void;
  onSegmentIndexChange?: (index: number) => void;
}

export function useAudioPlayback({ useMockTts, onStatusChange, onError, onSegmentIndexChange }: UseAudioPlaybackOptions) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const primedAudioRef = useRef<HTMLAudioElement | null>(null);
  const pendingAudioRef = useRef<{ text: string; blob: Blob; url: string } | null>(null);
  const segmentTimersRef = useRef<number[]>([]);
  const [mode, setMode] = useState<"idle" | "mock" | "audio" | "ready">("idle");

  useEffect(() => {
    return () => {
      clearSegmentTimers();
      if (pendingAudioRef.current) {
        URL.revokeObjectURL(pendingAudioRef.current.url);
      }
    };
  }, []);

  const play = async (text: string, segmentWeights: number[] = []) => {
    const pendingAudio = pendingAudioRef.current;

    try {
      if (useMockTts) {
        onStatusChange("speaking");
        setMode("mock");
        const durationMs = estimateMockDuration(text);
        scheduleSubtitleSegments(segmentWeights, durationMs / 1000);
        await mockSpeak(text, durationMs);
        clearSegmentTimers();
        onStatusChange("idle");
        setMode("idle");
        return;
      }

      if (pendingAudio && pendingAudio.text === text) {
        const primedAudio = consumePrimedAudio() ?? primeAudioElement();
        try {
          await playAudioBlob(pendingAudio.blob, pendingAudio.url, segmentWeights, primedAudio);
          URL.revokeObjectURL(pendingAudio.url);
          pendingAudioRef.current = null;
          onStatusChange("idle");
          setMode("idle");
        } catch (error) {
          if (isAutoplayBlocked(error)) {
            debugWarn("[tts:playback] browser still requires a real user tap. Keeping generated audio ready.", error);
            onStatusChange("idle");
            setMode("ready");
            return;
          }

          throw error;
        }
        return;
      }

      if (pendingAudio) {
        URL.revokeObjectURL(pendingAudio.url);
        pendingAudioRef.current = null;
      }

      onStatusChange("thinking");
      const primedAudio = consumePrimedAudio() ?? primeAudioElement();
      const audioBlob = await requestTtsAudio(text);
      if (!audioBlob) {
        onStatusChange("speaking");
        const durationMs = estimateMockDuration(text);
        scheduleSubtitleSegments(segmentWeights, durationMs / 1000);
        await mockSpeak(text, durationMs);
        clearSegmentTimers();
        onStatusChange("idle");
        return;
      }

      onStatusChange("speaking");
      setMode("audio");
      const audioUrl = URL.createObjectURL(audioBlob);
      debugLog("[tts:playback] object URL created:", Boolean(audioUrl));
      try {
        await playAudioBlob(audioBlob, audioUrl, segmentWeights, primedAudio);
      } catch (error) {
        if (isAutoplayBlocked(error)) {
          debugWarn("[tts:playback] browser blocked delayed playback. Keeping generated audio for the next tap.", error);
          pendingAudioRef.current = { text, blob: audioBlob, url: audioUrl };
          onStatusChange("idle");
          setMode("ready");
          return;
        }

        throw error;
      }

      URL.revokeObjectURL(audioUrl);
      debugLog("[tts:playback] object URL revoked after playback.");
      onStatusChange("idle");
      setMode("idle");
    } catch (error) {
      console.error("[tts:playback] playback flow failed:", error);
      onStatusChange("error");
      setMode("idle");
      clearSegmentTimers();
      onError("The voice went quiet. Try again.");
    }
  };

  const prime = () => {
    if (useMockTts) return;
    primedAudioRef.current = primeAudioElement();
    void primeAudioContext();
  };

  return { play, prime, mode };

  function consumePrimedAudio() {
    const audio = primedAudioRef.current;
    primedAudioRef.current = null;
    return audio;
  }

  function primeAudioElement() {
    const audio = audioRef.current ?? new Audio();
    audioRef.current = audio;
    audio.muted = true;
    audio.volume = 0;
    audio.src = SILENT_AUDIO_DATA_URL;
    audio.play()
      .then(() => {
        debugLog("[tts:playback] silent audio primer resolved.");
        audio.pause();
      })
      .catch((error) => {
        debugWarn("[tts:playback] silent audio primer rejected:", error);
      });
    return audio;
  }

  async function primeAudioContext() {
    const AudioContextClass = window.AudioContext ?? window.webkitAudioContext;
    if (!AudioContextClass) return null;

    const audioContext = audioContextRef.current ?? new AudioContextClass();
    audioContextRef.current = audioContext;

    try {
      if (audioContext.state !== "running") {
        await audioContext.resume();
      }

      const source = audioContext.createBufferSource();
      source.buffer = audioContext.createBuffer(1, 1, 22050);
      source.connect(audioContext.destination);
      source.start(0);
      debugLog("[tts:playback] AudioContext primed:", audioContext.state);
    } catch (error) {
      debugWarn("[tts:playback] AudioContext primer rejected:", error);
    }

    return audioContext;
  }

  async function playAudioBlob(audioBlob: Blob, audioUrl: string, segmentWeights: number[], existingAudio?: HTMLAudioElement) {
    const audioContext = audioContextRef.current;
    if (audioContext?.state === "running") {
      try {
        await playWithAudioContext(audioBlob, audioContext, segmentWeights);
        return;
      } catch (error) {
        debugWarn("[tts:playback] AudioContext playback failed; falling back to HTMLAudioElement.", error);
      }
    }

    await playObjectUrl(audioUrl, segmentWeights, existingAudio);
  }

  async function playWithAudioContext(audioBlob: Blob, audioContext: AudioContext, segmentWeights: number[]) {
    onStatusChange("speaking");
    setMode("audio");

    const audioBuffer = await audioContext.decodeAudioData(await audioBlob.arrayBuffer());
    await new Promise<void>((resolve, reject) => {
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      source.onended = () => {
        debugLog("[tts:playback] AudioContext playback ended.");
        clearSegmentTimers();
        resolve();
      };

      try {
        scheduleSubtitleSegments(segmentWeights, audioBuffer.duration);
        source.start(0);
        debugLog("[tts:playback] AudioContext playback started.");
      } catch (error) {
        reject(error);
      }
    });
  }

  async function playObjectUrl(audioUrl: string, segmentWeights: number[], existingAudio?: HTMLAudioElement) {
    onStatusChange("speaking");
    setMode("audio");
    const audio = existingAudio ?? new Audio();
    audioRef.current = audio;
    audio.pause();
    audio.currentTime = 0;
    audio.muted = false;
    audio.volume = 1;
    audio.src = audioUrl;
    audio.load();

    await new Promise<void>((resolve, reject) => {
      let didScheduleSegments = false;
      const scheduleWithAudioDuration = () => {
        if (didScheduleSegments) return;
        const duration = Number.isFinite(audio.duration) && audio.duration > 0
          ? audio.duration
          : estimateDuration(segmentWeights);
        scheduleSubtitleSegments(segmentWeights, duration);
        didScheduleSegments = true;
      };

      audio.onloadedmetadata = scheduleWithAudioDuration;
      audio.oncanplay = scheduleWithAudioDuration;
      audio.onended = () => {
        debugLog("[tts:playback] audio ended.");
        clearSegmentTimers();
        resolve();
      };
      audio.onerror = () => {
        console.error("[tts:playback] audio element error:", audio.error);
        reject(audio.error ?? new Error("Audio playback failed."));
      };
      audio.play()
        .then(() => {
          scheduleWithAudioDuration();
          debugLog("[tts:playback] audio.play() resolved.");
        })
        .catch((error) => {
          console.error("[tts:playback] audio.play() rejected:", error);
          reject(error);
        });
    });
  }

  function scheduleSubtitleSegments(segmentWeights: number[], durationSeconds: number) {
    clearSegmentTimers();
    const count = segmentWeights.length;
    if (!count) return;

    onSegmentIndexChange?.(0);
    if (count === 1) return;

    const totalWeight = segmentWeights.reduce((sum, weight) => sum + Math.max(1, weight), 0);
    const durationMs = Math.max(900, durationSeconds * 1000);
    let elapsed = 0;

    segmentWeights.slice(0, -1).forEach((weight, index) => {
      elapsed += (Math.max(1, weight) / totalWeight) * durationMs;
      const timer = window.setTimeout(() => {
        onSegmentIndexChange?.(index + 1);
      }, Math.max(450, elapsed));
      segmentTimersRef.current.push(timer);
    });
  }

  function clearSegmentTimers() {
    segmentTimersRef.current.forEach((timer) => window.clearTimeout(timer));
    segmentTimersRef.current = [];
  }
}

function isAutoplayBlocked(error: unknown) {
  return error instanceof DOMException && error.name === "NotAllowedError";
}

function debugLog(...args: unknown[]) {
  if (debugPlayback) console.info(...args);
}

function debugWarn(...args: unknown[]) {
  if (debugPlayback) console.warn(...args);
}

async function mockSpeak(text: string, durationMs: number) {
  void text;
  await new Promise((resolve) => window.setTimeout(resolve, durationMs));
}

function estimateMockDuration(text: string) {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.min(12000, Math.max(1400, words * 520));
}

function estimateDuration(segmentWeights: number[]) {
  const totalWeight = segmentWeights.reduce((sum, weight) => sum + Math.max(1, weight), 0);
  return Math.min(14, Math.max(1.2, totalWeight * 0.045));
}
