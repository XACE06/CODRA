import { MusicRecommendationCard } from "./MusicRecommendationCard";
import type { MusicRecommendation } from "../lib/types";

interface MusicResultPanelProps {
  cards: Array<{
    id: string;
    recommendation: MusicRecommendation;
    position: "left" | "right" | "center";
    isClosing: boolean;
  }>;
  onCloseCard: (id: string) => void;
}

export function MusicResultPanel({
  cards,
  onCloseCard
}: MusicResultPanelProps) {
  if (!cards.length) return null;

  return (
    <div className="music-result-panel-position" aria-live="polite">
      <section
        className="music-result-panel"
        aria-label="Music recommendations"
      >
        <div className="music-result-content">
          <div className="music-card-row">
            {cards.map((item, index) => (
              <MusicRecommendationCard
                key={item.id}
                recommendation={item.recommendation}
                index={index}
                position={item.position}
                isClosing={item.isClosing}
                onClose={() => onCloseCard(item.id)}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
