export type ColumnId = "todo" | "in-progress" | "done";

export interface Card {
  id: string;
  title: string;
  columnId: ColumnId;
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
  | { type: "RESTORE_CARD"; card: Card; index: number };
