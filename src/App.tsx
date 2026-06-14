import { useEffect, useMemo, useRef, useState } from "react";
import { CodraOrb } from "./components/CodraOrb";
import { DevControls } from "./components/DevControls";
import { InputBar } from "./components/InputBar";
import { MusicResultPanel } from "./components/MusicResultPanel";
import { SubtitlePanel } from "./components/SubtitlePanel";
import { useAudioPlayback } from "./hooks/useAudioPlayback";
import { useCodraChat } from "./hooks/useCodraChat";
import { useSpeechInput } from "./hooks/useSpeechInput";
import { buildSubtitleSegments, getSubtitleWeights } from "./lib/subtitleSegments";
import type { MusicRecommendation } from "./lib/types";

interface MusicCardState {
  id: string;
  recommendation: MusicRecommendation;
  position: "left" | "right" | "center";
  isClosing: boolean;
}

const MUSIC_EXIT_MS = 420;

export default function App() {
  const chat = useCodraChat();
  const lastAutoPlayedRef = useRef("");
  const transitionTimerRef = useRef<number | null>(null);
  const cardCloseTimersRef = useRef<number[]>([]);
  const manualSubtitleModeRef = useRef(false);
  const [musicCards, setMusicCards] = useState<MusicCardState[]>([]);
  const [activeSubtitleIndex, setActiveSubtitleIndex] = useState(0);
  const subtitleSegments = useMemo(() => buildSubtitleSegments(chat.currentReply), [chat.currentReply]);
  const subtitleWeights = useMemo(() => getSubtitleWeights(subtitleSegments), [subtitleSegments]);
  const audio = useAudioPlayback({
    useMockTts: chat.config?.useMockTts ?? true,
    onStatusChange: chat.setStatus,
    onError: chat.handleVoiceError,
    onSegmentIndexChange: (index) => {
      if (!manualSubtitleModeRef.current) setActiveSubtitleIndex(index);
    }
  });
  const speechInput = useSpeechInput({
    onStatusChange: chat.setStatus,
    onResult: chat.setDraft,
    onError: chat.setError
  });

  const playVoice = async () => {
    if (!chat.currentReply) return;
    await audio.play(chat.currentReply.reply_en, subtitleWeights);
  };

  const makeMusicCards = (recommendations: MusicRecommendation[]): MusicCardState[] =>
    recommendations.map((recommendation, index) => ({
      id: `${recommendation.title}-${recommendation.artist}-${Date.now()}-${index}`,
      recommendation,
      position: index === 0 ? "left" : index === 1 ? "right" : "center" as MusicCardState["position"],
      isClosing: false
    }));

  const clearMusicTimers = () => {
    if (transitionTimerRef.current) window.clearTimeout(transitionTimerRef.current);
    transitionTimerRef.current = null;
    cardCloseTimersRef.current.forEach((timer) => window.clearTimeout(timer));
    cardCloseTimersRef.current = [];
  };

  const closeMusicCard = (id: string) => {
    setMusicCards((cards) =>
      cards.map((card) => (card.id === id ? { ...card, isClosing: true } : card))
    );

    const timer = window.setTimeout(() => {
      setMusicCards((cards) => cards.filter((card) => card.id !== id));
      cardCloseTimersRef.current = cardCloseTimersRef.current.filter((item) => item !== timer);
    }, MUSIC_EXIT_MS);
    cardCloseTimersRef.current.push(timer);
  };

  const closeAllMusicCards = () => {
    if (!musicCards.length) return;
    clearMusicTimers();
    setMusicCards((cards) => cards.map((card) => ({ ...card, isClosing: true })));
    transitionTimerRef.current = window.setTimeout(() => {
      setMusicCards([]);
      transitionTimerRef.current = null;
    }, MUSIC_EXIT_MS);
  };

  const transitionToMusicCards = (recommendations: MusicRecommendation[]) => {
    clearMusicTimers();

    if (!musicCards.length) {
      setMusicCards(makeMusicCards(recommendations));
      return;
    }

    setMusicCards((cards) => {
      return cards.map((card) => ({ ...card, isClosing: true }));
    });

    transitionTimerRef.current = window.setTimeout(() => {
      setMusicCards(makeMusicCards(recommendations));
      transitionTimerRef.current = null;
    }, MUSIC_EXIT_MS);
  };

  const handleDraftChange = (value: string) => {
    chat.setDraft(value);
  };

  const handleSubmit = () => {
    closeAllMusicCards();
    manualSubtitleModeRef.current = false;
    if (chat.config?.autoTts) audio.prime();
    void chat.send();
  };

  const goToPreviousSubtitle = () => {
    manualSubtitleModeRef.current = true;
    setActiveSubtitleIndex((index) => Math.max(0, index - 1));
  };

  const goToNextSubtitle = () => {
    manualSubtitleModeRef.current = true;
    setActiveSubtitleIndex((index) => Math.min(Math.max(0, subtitleSegments.length - 1), index + 1));
  };

  useEffect(() => {
    return () => {
      clearMusicTimers();
    };
  }, []);

  useEffect(() => {
    const recommendations = chat.currentReply?.music_recommendations ?? [];
    if (recommendations.length) transitionToMusicCards(recommendations);
    manualSubtitleModeRef.current = false;
    setActiveSubtitleIndex(0);
  }, [chat.currentReply]);

  useEffect(() => {
    setActiveSubtitleIndex((index) => Math.min(index, Math.max(0, subtitleSegments.length - 1)));
  }, [subtitleSegments.length]);

  useEffect(() => {
    if (!chat.config?.autoTts || !chat.currentReply) return;
    if (lastAutoPlayedRef.current === chat.currentReply.reply_en) return;

    lastAutoPlayedRef.current = chat.currentReply.reply_en;
    void audio.play(chat.currentReply.reply_en, subtitleWeights);
  }, [audio, chat.config?.autoTts, chat.currentReply, subtitleWeights]);

  return (
    <main className="app-shell">
      <section className="codra-stage" aria-label="Codra voice interaction prototype">
        <div className="orb-zone">
          <CodraOrb status={chat.status} />
        </div>

        <section className="response-zone">
          <SubtitlePanel
            reply={chat.currentReply}
            segment={subtitleSegments[activeSubtitleIndex] ?? subtitleSegments[0] ?? null}
            segmentIndex={activeSubtitleIndex}
            segmentCount={subtitleSegments.length}
            status={chat.status}
            error={chat.error}
            onPreviousSegment={goToPreviousSubtitle}
            onNextSegment={goToNextSubtitle}
          />

          {chat.currentReply && chat.status !== "error" && (!chat.config?.autoTts || audio.mode === "ready") ? (
            <button
              className="voice-button"
              type="button"
              onClick={playVoice}
              disabled={chat.status === "speaking" || chat.status === "thinking"}
            >
              {chat.status === "speaking" ? "Playing..." : audio.mode === "ready" ? "Tap to Play" : "Play Voice"}
            </button>
          ) : null}
        </section>

        <InputBar
          value={chat.draft}
          onChange={handleDraftChange}
          onSubmit={handleSubmit}
          disabled={chat.status === "thinking" || chat.status === "speaking"}
          onMicClick={speechInput.start}
          isListening={chat.status === "listening"}
          speechSupported={speechInput.supported}
        />
      </section>

      {musicCards.length ? (
        <MusicResultPanel
          cards={musicCards}
          onCloseCard={closeMusicCard}
        />
      ) : null}

      <DevControls config={chat.config} />
    </main>
  );
}
