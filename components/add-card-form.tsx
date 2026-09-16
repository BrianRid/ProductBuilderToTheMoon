import { useEffect, useRef, useState, type FormEvent } from "react";
import { useBoard } from "@/board/board-context";

const MAX_TITLE_LENGTH = 120;
const EMPTY_TITLE_ERROR = "Un titre est nécessaire pour créer la carte.";

export function AddCardForm() {
  const { dispatch } = useBoard();
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const openButtonRef = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);

  // Focus follows the form: into the field when it opens, back onto the
  // button when it closes — but never on first mount, when neither happened.
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    } else if (wasOpen.current) {
      openButtonRef.current?.focus();
    }
    wasOpen.current = isOpen;
  }, [isOpen]);

  function close() {
    setIsOpen(false);
    setTitle("");
    setError(null);
  }

  // Trim first: a title made only of spaces is empty. The reducer is never
  // reached with an invalid title, and never with an untrimmed one.
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmed = title.trim();
    if (!trimmed) {
      setError(EMPTY_TITLE_ERROR);
      inputRef.current?.focus();
      return;
    }

    dispatch({ type: "ADD_CARD", title: trimmed });
    setTitle("");
    setError(null);
    inputRef.current?.focus();
  }

  if (!isOpen) {
    return (
      <button
        ref={openButtonRef}
        type="button"
        onClick={() => setIsOpen(true)}
        className="rounded-md px-3 py-2 text-left text-sm text-paper-dim transition-colors hover:text-paper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
      >
        + Ajouter une carte
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          close();
        }
      }}
      className="flex flex-col gap-2"
    >
      <label htmlFor="add-card-title" className="sr-only">
        Titre de la carte
      </label>
      <input
        ref={inputRef}
        id="add-card-title"
        value={title}
        maxLength={MAX_TITLE_LENGTH}
        placeholder="Titre de la carte"
        aria-invalid={error !== null}
        aria-describedby={error ? "add-card-error" : undefined}
        onChange={(event) => {
          setTitle(event.target.value);
          if (error) {
            setError(null);
          }
        }}
        className="rounded-md border border-line bg-panel-raised px-3 py-2 text-sm text-paper outline-none placeholder:text-paper-dim focus:border-signal focus:ring-2 focus:ring-signal/20"
      />
      {error && (
        <p id="add-card-error" role="alert" className="text-xs text-signal">
          {error}
        </p>
      )}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          className="rounded-md bg-signal px-3 py-2 text-sm font-semibold text-ink transition-[filter] hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
        >
          Ajouter
        </button>
        <span className="text-xs text-paper-dim">Échap pour fermer</span>
      </div>
    </form>
  );
}
