import type { BoardAction, BoardState } from "./types";

export const initialBoardState: BoardState = {
  cards: [{ id: "card-1", title: "Carte d'exemple", columnId: "todo" }],
};

// Extension seam: each workshop feature adds its own case here.
export function boardReducer(state: BoardState, action: BoardAction): BoardState {
  switch (action.type) {
    case "NOOP":
      return state;
    default:
      return state;
  }
}
