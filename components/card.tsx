import { useState } from "react";
import { useBoard } from "@/board/board-context";
import type { Card as CardType } from "@/board/types";

interface CardProps {
  card: CardType;
}

export function Card({ card }: CardProps) {
  const { dispatch } = useBoard();
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(card.title);

  const serial = card.id.replace(/\D/g, "").padStart(2, "0");

  function startEditing() {
    setDraft(card.title);
    setIsEditing(true);
  }

  // Trim, then ignore an empty or unchanged title: no action reaches the reducer.
  function commit() {
    const title = draft.trim();
    if (title && title !== card.title) {
      dispatch({ type: "EDIT_CARD", id: card.id, title });
    }
    setIsEditing(false);
  }

  function cancel() {
    setDraft(card.title);
    setIsEditing(false);
  }

  return (
    <div className="border-l-2 border-line bg-panel-raised px-3 py-2.5 text-sm text-paper transition-colors hover:border-signal">
      {isEditing ? (
        <input
          autoFocus
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onFocus={(event) => event.target.select()}
          onBlur={commit}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              commit();
            } else if (event.key === "Escape") {
              cancel();
            }
          }}
          className="w-full border-b border-signal bg-transparent text-sm text-paper outline-none"
        />
      ) : (
        <p onDoubleClick={startEditing}>{card.title}</p>
      )}
      <p className="mt-1 font-mono text-[11px] text-paper-dim">#{serial}</p>
    </div>
  );
}
