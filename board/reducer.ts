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
            : card,
        ),
      };
    case "SET_LABEL":
      return {
        ...state,
        cards: state.cards.map((card) =>
          card.id === action.id
            ? { ...card, label: action.label ?? undefined }
            : card,
        ),
      };
    case "SET_DUE_DATE":
      return {
        ...state,
        cards: state.cards.map((card) =>
          card.id === action.id
            ? { ...card, dueDate: action.dueDate ?? undefined }
            : card,
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
    case "ADD_CARD": {
      // The serial shown on a card is derived from the digits of its id
      // (see components/card.tsx), hence a running sequence rather than a uuid.
      const lastSerial = state.cards.reduce((max, card) => {
        const serial = Number(card.id.replace(/\D/g, ""));
        return Number.isFinite(serial) && serial > max ? serial : max;
      }, 0);

      return {
        ...state,
        cards: [
          ...state.cards,
          { id: `card-${lastSerial + 1}`, title: action.title, columnId: "todo" },
        ],
      };
    }
    default:
      return state;
  }
}
