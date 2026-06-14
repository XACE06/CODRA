import type { PublicConfig } from "../lib/types";

interface DevControlsProps {
  config: PublicConfig | null;
}

export function DevControls({ config }: DevControlsProps) {
  if (!config?.showDevControls) return null;

  return (
    <aside className="dev-controls" aria-label="Development controls">
      <span>Mock Chat: {config.useMockChat ? "On" : "Off"}</span>
      <span>Mock TTS: {config.useMockTts ? "On" : "Off"}</span>
      <span>Auto TTS: {config.autoTts ? "On" : "Off"}</span>
      <span>TTS Cache: {config.enableTtsCache ? "On" : "Off"}</span>
    </aside>
  );
}
