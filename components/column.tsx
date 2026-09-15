import type { Card as CardType } from "@/board/types";
import { Card } from "./card";

interface ColumnProps {
  title: string;
  cards: CardType[];
  indicatorClassName: string;
}

export function Column({ title, cards, indicatorClassName }: ColumnProps) {
  return (
    <div className="flex min-w-[240px] flex-1 flex-col bg-panel">
      <div className={`h-0.5 ${indicatorClassName}`} />
      <div className="flex items-baseline justify-between px-4 py-3">
        <h2 className="text-sm font-medium text-paper">{title}</h2>
        <span className="font-mono text-xs tabular-nums text-paper-dim">
          {String(cards.length).padStart(2, "0")}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 px-4 pb-4">
        {cards.map((card) => (
          <Card key={card.id} card={card} />
        ))}
      </div>
    </div>
  );
}
