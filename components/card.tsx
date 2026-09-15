import type { Card as CardType } from "@/board/types";

interface CardProps {
  card: CardType;
}

export function Card({ card }: CardProps) {
  return (
    <div className="rounded-md border border-zinc-200 bg-white p-3 text-sm text-zinc-900 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50">
      {card.title}
    </div>
  );
}
