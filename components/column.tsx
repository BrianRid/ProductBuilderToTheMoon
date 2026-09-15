import type { Card as CardType } from "@/board/types";
import { Card } from "./card";

interface ColumnProps {
  title: string;
  cards: CardType[];
}

export function Column({ title, cards }: ColumnProps) {
  return (
    <div className="flex w-72 flex-shrink-0 flex-col gap-3 rounded-lg bg-zinc-100 p-3 dark:bg-zinc-900">
      <h2 className="px-1 text-sm font-semibold text-zinc-500 dark:text-zinc-400">
        {title}{" "}
        <span className="text-zinc-400 dark:text-zinc-600">({cards.length})</span>
      </h2>
      <div className="flex flex-col gap-2">
        {cards.map((card) => (
          <Card key={card.id} card={card} />
        ))}
      </div>
    </div>
  );
}
