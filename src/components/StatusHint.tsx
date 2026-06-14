import type { CodraStatus } from "../lib/types";

interface StatusHintProps {
  status: CodraStatus;
}

const statusLabel: Record<CodraStatus, string> = {
  idle: "Idle",
  listening: "Listening",
  thinking: "Thinking",
  speaking: "Speaking",
  error: "Quiet"
};

export function StatusHint({ status }: StatusHintProps) {
  return (
    <p className={`status-hint status-${status}`} aria-live="polite">
      {statusLabel[status]}
    </p>
  );
}
