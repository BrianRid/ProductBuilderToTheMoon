export type ColumnId = "todo" | "in-progress" | "done";

export type LabelColor = "rust" | "plum" | "slate" | "moss";

export interface Card {
  id: string;
  title: string;
  columnId: ColumnId;
  label?: LabelColor;
  dueDate?: string; // ISO "YYYY-MM-DD"
}

export interface BoardState {
  cards: Card[];
}

// Extension seam: each workshop feature adds its own variant here.
export type BoardAction =
  | { type: "NOOP" }
  | { type: "EDIT_CARD"; id: string; title: string }
  | { type: "MOVE_CARD"; cardId: string; targetColumnId: ColumnId }
  | { type: "DELETE_CARD"; id: string }
  | { type: "RESTORE_CARD"; card: Card; index: number }
  | { type: "SET_LABEL"; id: string; label: LabelColor | null }
  | { type: "SET_DUE_DATE"; id: string; dueDate: string | null };
