import type { Card as CardType } from "@/board/types";

interface CardProps {
  card: CardType;
}

export function Card({ card }: CardProps) {
  const serial = card.id.replace(/\D/g, "").padStart(2, "0");

  return (
    <div className="border-l-2 border-line bg-panel-raised px-3 py-2.5 text-sm text-paper transition-colors hover:border-signal">
      <p>{card.title}</p>
      <p className="mt-1 font-mono text-[11px] text-paper-dim">#{serial}</p>
    </div>
  );
}
