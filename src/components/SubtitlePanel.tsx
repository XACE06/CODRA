import { useEffect, useState } from "react";
import type { CodraReply, CodraStatus } from "../lib/types";
import type { SubtitleSegment } from "../lib/subtitleSegments";

interface SubtitlePanelProps {
  reply: CodraReply | null;
  segment: SubtitleSegment | null;
  segmentIndex: number;
  segmentCount: number;
  status: CodraStatus;
  error: string;
  onPreviousSegment: () => void;
  onNextSegment: () => void;
}

const introReply: CodraReply = {
  reply_en: "Hey. I'm Codra. Say something when you're ready.",
  reply_zh: "嘿，我是 Codra。准备好了，就和我说点什么。",
  emotion: "calm",
  music_recommendations: []
};

interface DisplaySubtitle {
  en: string;
  zh: string;
}

export function SubtitlePanel({
  reply,
  segment,
  segmentIndex,
  segmentCount,
  status,
  error,
  onPreviousSegment,
  onNextSegment
}: SubtitlePanelProps) {
  const content = reply ?? introReply;
  const isError = status === "error";
  const showNavigation = Boolean(reply) && !isError && segmentCount > 1;
  const nextSubtitle = {
    en: status === "thinking" ? "Give me a second..." : isError ? "Something went quiet for a second. Try again." : segment?.reply_en || content.reply_en,
    zh: status === "thinking" ? "稍等一秒。" : isError ? "刚刚有点安静了。再试一次。" : segment?.reply_zh || content.reply_zh
  };
  const [activeSubtitle, setActiveSubtitle] = useState<DisplaySubtitle>(nextSubtitle);
  const [exitingSubtitle, setExitingSubtitle] = useState<DisplaySubtitle | null>(null);

  useEffect(() => {
    let didChange = false;
    setActiveSubtitle((current) => {
      const sameSubtitle = current.en === nextSubtitle.en && current.zh === nextSubtitle.zh;
      if (sameSubtitle) return current;
      didChange = true;
      setExitingSubtitle(current);
      return nextSubtitle;
    });

    if (!didChange) return;

    const timer = window.setTimeout(() => {
      setExitingSubtitle(null);
    }, 420);

    return () => window.clearTimeout(timer);
  }, [nextSubtitle.en, nextSubtitle.zh]);

  return (
    <div className="subtitle-panel">
      {showNavigation ? (
        <button
          className="subtitle-nav subtitle-nav-left"
          type="button"
          aria-label="Previous subtitle"
          onClick={onPreviousSegment}
          disabled={segmentIndex <= 0}
        >
          <span aria-hidden="true">‹</span>
        </button>
      ) : null}
      {exitingSubtitle ? (
        <div className="subtitle-copy is-exiting" aria-hidden="true">
          <p className="subtitle-en">{exitingSubtitle.en}</p>
          <p className="subtitle-zh">{exitingSubtitle.zh}</p>
        </div>
      ) : null}
      <div className="subtitle-copy" key={`${activeSubtitle.en}-${activeSubtitle.zh}`}>
        <p className="subtitle-en">{activeSubtitle.en}</p>
        <p className="subtitle-zh">{activeSubtitle.zh}</p>
      </div>
      {showNavigation ? (
        <button
          className="subtitle-nav subtitle-nav-right"
          type="button"
          aria-label="Next subtitle"
          onClick={onNextSegment}
          disabled={segmentIndex >= segmentCount - 1}
        >
          <span aria-hidden="true">›</span>
        </button>
      ) : null}
      {isError && error ? <p className="error-line">{error}</p> : null}
    </div>
  );
}
