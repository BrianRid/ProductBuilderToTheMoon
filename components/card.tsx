import { useId, useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import { toast } from "sonner";
import { useBoard } from "@/board/board-context";
import type { Card as CardType, LabelColor } from "@/board/types";

const ERROR_BORDER = "border-abort ring-abort/25";
const FOCUS_BORDER = "border-signal ring-signal/20";

interface CardProps {
  card: CardType;
}

const LABEL_COLORS: LabelColor[] = ["rust", "plum", "slate", "moss"];

const LABEL_BG: Record<LabelColor, string> = {
  rust: "bg-label-rust",
  plum: "bg-label-plum",
  slate: "bg-label-slate",
  moss: "bg-label-moss",
};

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function Card({ card }: CardProps) {
  const { state, dispatch } = useBoard();
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: card.id,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(card.title);
  const [error, setError] = useState(false);
  const [isEditingMeta, setIsEditingMeta] = useState(false);
  const [draftDueDate, setDraftDueDate] = useState(card.dueDate ?? "");

  const errorId = useId();
  const serial = card.id.replace(/\D/g, "").padStart(2, "0");
  const isOverdue =
    !!card.dueDate && card.dueDate < todayISO() && card.columnId !== "done";

  function startEditing() {
    setDraft(card.title);
    setError(false);
    setIsEditingMeta(false);
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

  function handleDelete() {
    if (!window.confirm("Supprimer cette carte ?")) return;

    const index = state.cards.findIndex((c) => c.id === card.id);
    dispatch({ type: "DELETE_CARD", id: card.id });

    toast("Carte supprimée", {
      action: {
        label: "Annuler",
        onClick: () => dispatch({ type: "RESTORE_CARD", card, index }),
      },
    });
  }

  function openMetaEditor() {
    setDraftDueDate(card.dueDate ?? "");
    setIsEditing(false);
    setIsEditingMeta(true);
  }

  // Dispatched immediately on click, not held in a draft: there is nothing
  // to "undo" on Escape, the pill selection is already the source of truth.
  function toggleLabel(color: LabelColor) {
    dispatch({ type: "SET_LABEL", id: card.id, label: card.label === color ? null : color });
  }

  function commitDueDate() {
    dispatch({ type: "SET_DUE_DATE", id: card.id, dueDate: draftDueDate || null });
    setIsEditingMeta(false);
  }

  function cancelMeta() {
    setDraftDueDate(card.dueDate ?? "");
    setIsEditingMeta(false);
  }

  return (
    <div
      ref={setNodeRef}
      {...(isEditing ? {} : listeners)}
      {...attributes}
      className={`group relative cursor-grab touch-none border-l-2 bg-panel-raised px-3 py-2.5 text-sm text-paper shadow-[0_2px_8px_rgb(0_0_0_/_0.18)] transition-colors ${
        isDragging
          ? "border-line opacity-40"
          : isOverdue
            ? "border-abort hover:shadow-[0_6px_18px_rgb(0_0_0_/_0.24)]"
            : "border-line hover:border-signal hover:shadow-[0_6px_18px_rgb(0_0_0_/_0.24)]"
      }`}
    >
      <button
        type="button"
        onClick={handleDelete}
        aria-label="Supprimer la carte"
        className="absolute right-1.5 top-1.5 rounded-md px-1.5 py-0.5 text-paper-dim opacity-0 transition-opacity hover:text-paper group-hover:opacity-100"
      >
        ×
      </button>
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
            <p id={errorId} className="mt-2 text-[11px] text-abort">
              Le titre ne peut pas être vide — Échap pour annuler
            </p>
          )}
        </>
      ) : (
        <p onDoubleClick={startEditing}>{card.title}</p>
      )}
      {isEditingMeta ? (
        <div className="-mx-2 mt-1 flex flex-col gap-2 rounded-md border border-signal bg-panel-raised p-2">
          <div className="flex gap-1.5">
            {LABEL_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                title={color}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => toggleLabel(color)}
                className={`h-4 w-4 rounded-full ${LABEL_BG[color]} ${
                  card.label === color
                    ? "ring-2 ring-signal ring-offset-1 ring-offset-panel-raised"
                    : ""
                }`}
              />
            ))}
          </div>
          <input
            type="date"
            autoFocus
            value={draftDueDate}
            onChange={(event) => setDraftDueDate(event.target.value)}
            onBlur={commitDueDate}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                commitDueDate();
              } else if (event.key === "Escape") {
                cancelMeta();
              }
            }}
            className="rounded-md border border-line bg-panel-raised px-2 py-1 text-xs text-paper outline-none focus:border-signal focus:ring-2 focus:ring-signal/20"
          />
        </div>
      ) : (
        <div
          onClick={openMetaEditor}
          className="mt-1 flex cursor-pointer items-center gap-2 font-mono text-[11px] text-paper-dim"
        >
          {card.label && (
            <span className={`h-2 w-2 rounded-full ${LABEL_BG[card.label]}`} title={card.label} />
          )}
          {card.dueDate && (
            <span className={isOverdue ? "text-abort" : undefined}>{card.dueDate}</span>
          )}
          <span>#{serial}</span>
        </div>
      )}
    </div>
  );
}

export function CardOverlay({ card }: CardProps) {
  const serial = card.id.replace(/\D/g, "").padStart(2, "0");

  return (
    <div className="cursor-grabbing border-l-2 border-signal bg-panel-raised px-3 py-2.5 text-sm text-paper shadow-[0_6px_18px_rgb(0_0_0_/_0.24)]">
      <p>{card.title}</p>
      <p className="mt-1 font-mono text-[11px] text-paper-dim">#{serial}</p>
    </div>
  );
}
