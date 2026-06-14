import type { CodraStatus } from "../lib/types";

interface CodraOrbProps {
  status: CodraStatus;
}

export function CodraOrb({ status }: CodraOrbProps) {
  return (
    <div className={`orb-wrap orb-${status}`} aria-hidden="true">
      <div className="orb-halo" />
      <div className="orb-core" />
      <div className="orb-ring" />
    </div>
  );
}
