import type { BoardAction, BoardState } from "./types";

export const initialBoardState: BoardState = {
  cards: [{ id: "card-1", title: "Carte d'exemple", columnId: "todo" }],
};

// Extension seam: each workshop feature adds its own case here.
export function boardReducer(state: BoardState, action: BoardAction): BoardState {
  switch (action.type) {
    case "NOOP":
      return state;
    case "EDIT_CARD":
      return {
        ...state,
        cards: state.cards.map((card) =>
          card.id === action.id ? { ...card, title: action.title } : card,
        ),
      };
    case "MOVE_CARD":
      return {
        ...state,
        cards: state.cards.map((card) =>
          card.id === action.cardId
            ? { ...card, columnId: action.targetColumnId }
            : card
        ),
      };
    case "DELETE_CARD":
      return {
        ...state,
        cards: state.cards.filter((card) => card.id !== action.id),
      };
    case "RESTORE_CARD":
      return {
        ...state,
        cards: [
          ...state.cards.slice(0, action.index),
          action.card,
          ...state.cards.slice(action.index),
        ],
      };
    default:
      return state;
  }
}
