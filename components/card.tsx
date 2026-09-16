import { useId, useState } from "react";
import { useBoard } from "@/board/board-context";
import type { Card as CardType } from "@/board/types";

// The design system has no error colour yet: this warm red sits in the same
// nocturnal family as the palette, pending an official token.
const ERROR_BORDER = "border-[#d9614a] ring-[#d9614a]/25";
const FOCUS_BORDER = "border-signal ring-signal/20";

interface CardProps {
  card: CardType;
}

export function Card({ card }: CardProps) {
  const { dispatch } = useBoard();
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(card.title);
  const [error, setError] = useState(false);

  const errorId = useId();
  const serial = card.id.replace(/\D/g, "").padStart(2, "0");

  function startEditing() {
    setDraft(card.title);
    setError(false);
    setIsEditing(true);
  }

  // An empty title keeps the field open and flags it, rather than silently
  // reverting: a rejected edit has to say why. An unchanged title sends no
  // action to the reducer.
  function commit() {
    const title = draft.trim();
    if (!title) {
      setError(true);
      return;
    }
    if (title !== card.title) {
      dispatch({ type: "EDIT_CARD", id: card.id, title });
    }
    setError(false);
    setIsEditing(false);
  }

  function cancel() {
    setDraft(card.title);
    setError(false);
    setIsEditing(false);
  }

  return (
    <div className="border-l-2 border-line bg-panel-raised px-3 py-2.5 text-sm text-paper transition-colors hover:border-signal">
      {isEditing ? (
        <>
          <input
            autoFocus
            value={draft}
            aria-invalid={error}
            aria-describedby={error ? errorId : undefined}
            onChange={(event) => {
              setDraft(event.target.value);
              setError(false);
            }}
            onFocus={(event) => event.target.select()}
            onBlur={commit}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                commit();
              } else if (event.key === "Escape") {
                cancel();
              }
            }}
            className={`-mx-2 -my-1 w-[calc(100%+1rem)] rounded-md border bg-panel-raised px-2 py-1 text-sm text-paper outline-none ring-2 ${
              error ? ERROR_BORDER : FOCUS_BORDER
            }`}
          />
          {error && (
            <p id={errorId} className="mt-2 text-[11px] text-[#d9614a]">
              Le titre ne peut pas être vide — Échap pour annuler
            </p>
          )}
        </>
      ) : (
        <p onDoubleClick={startEditing}>{card.title}</p>
      )}
      <p className="mt-1 font-mono text-[11px] text-paper-dim">#{serial}</p>
    </div>
  );
}
