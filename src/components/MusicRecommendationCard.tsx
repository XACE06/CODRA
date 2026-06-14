import type { MusicRecommendation } from "../lib/types";

interface MusicRecommendationCardProps {
  recommendation: MusicRecommendation;
  index?: number;
  position?: "left" | "right" | "center";
  isClosing?: boolean;
  onClose?: () => void;
}

export function MusicRecommendationCard({
  recommendation,
  index = 0,
  position = "left",
  isClosing = false,
  onClose
}: MusicRecommendationCardProps) {
  return (
    <article
      className={`music-card position-${position} ${isClosing ? "is-closing" : ""}`}
      style={{ animationDelay: isClosing ? "0ms" : `${index * 80}ms` }}
    >
      <button
        className="music-card-close"
        type="button"
        onClick={onClose}
        aria-label={`Close ${recommendation.title}`}
      >
        <span aria-hidden="true">×</span>
      </button>
      <div>
        <p className="song-title">{recommendation.title}</p>
        <p className="song-artist">{recommendation.artist}</p>
      </div>
      <p className="song-reason">{recommendation.reason_en}</p>
      <p className="song-reason-zh">{recommendation.reason_zh}</p>
      <a href={recommendation.apple_music_search_url} target="_blank" rel="noreferrer">
        Open in Apple Music
      </a>
    </article>
  );
}
