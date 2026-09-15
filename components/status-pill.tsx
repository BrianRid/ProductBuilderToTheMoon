"use client";

import { useBoard } from "@/board/board-context";

export function StatusPill() {
  const { state } = useBoard();
  const count = state.cards.length;

  return (
    <div className="flex items-center gap-2 rounded-full border border-signal/30 bg-signal/10 px-3 py-1">
      <span className="h-1.5 w-1.5 rounded-full bg-signal" />
      <span className="font-mono text-xs tabular-nums text-signal">
        {String(count).padStart(2, "0")}
      </span>
      <span className="text-xs text-paper-dim">
        {count === 1 ? "carte en vol" : "cartes en vol"}
      </span>
    </div>
  );
}
