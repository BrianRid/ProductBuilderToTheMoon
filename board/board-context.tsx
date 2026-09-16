"use client";

import {
  createContext,
  useEffect,
  useContext,
  useReducer,
  useRef,
  type Dispatch,
  type ReactNode,
} from "react";
import { boardReducer, initialBoardState } from "./reducer";
import type { BoardAction, BoardState, Card } from "./types";

export const BOARD_STORAGE_KEY = "product-builder-to-the-moon:board";

const COLUMN_IDS = new Set(["todo", "in-progress", "done"]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isValidCard(value: unknown): value is Card {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    value.id.trim().length > 0 &&
    typeof value.title === "string" &&
    value.title.trim().length > 0 &&
    typeof value.columnId === "string" &&
    COLUMN_IDS.has(value.columnId)
  );
}

export function parseStoredBoardState(value: string | null): BoardState | null {
  if (value === null) {
    return null;
  }

  try {
    const candidate: unknown = JSON.parse(value);

    if (
      !isRecord(candidate) ||
      !Array.isArray(candidate.cards) ||
      !candidate.cards.every(isValidCard)
    ) {
      return null;
    }

    return { cards: candidate.cards };
  } catch {
    return null;
  }
}

export function readStoredBoardState(
  storage: Pick<Storage, "getItem">,
): BoardState | null {
  try {
    return parseStoredBoardState(storage.getItem(BOARD_STORAGE_KEY));
  } catch {
    return null;
  }
}

export function writeStoredBoardState(
  storage: Pick<Storage, "setItem">,
  state: BoardState,
): boolean {
  try {
    storage.setItem(BOARD_STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

interface ProviderState {
  board: BoardState;
  hydrated: boolean;
}

type ReplaceBoardAction = {
  type: "REPLACE_BOARD";
  state: BoardState;
};

type ProviderAction = BoardAction | ReplaceBoardAction;

export function providerReducer(
  state: ProviderState,
  action: ProviderAction,
): ProviderState {
  if (action.type === "REPLACE_BOARD") {
    return { board: action.state, hydrated: true };
  }

  return {
    ...state,
    board: boardReducer(state.board, action),
  };
}

export function getBoardStateFromStorageEvent(
  event: Pick<StorageEvent, "key" | "newValue" | "storageArea">,
  expectedStorage: Storage,
): BoardState | undefined {
  if (
    event.key !== BOARD_STORAGE_KEY ||
    event.storageArea !== expectedStorage
  ) {
    return undefined;
  }

  if (event.newValue === null) {
    return initialBoardState;
  }

  return parseStoredBoardState(event.newValue) ?? undefined;
}

export function getBrowserStorage(
  browserWindow: Pick<Window, "localStorage"> = window,
): Storage | null {
  try {
    return browserWindow.localStorage;
  } catch {
    return null;
  }
}

interface BoardContextValue {
  state: BoardState;
  dispatch: Dispatch<BoardAction>;
}

const BoardContext = createContext<BoardContextValue | null>(null);

export function BoardProvider({ children }: { children: ReactNode }) {
  const [{ board: state, hydrated }, providerDispatch] = useReducer(
    providerReducer,
    { board: initialBoardState, hydrated: false },
  );
  const lastPersistedState = useRef<string | null>(null);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    const serializedState = JSON.stringify(state);

    if (lastPersistedState.current === serializedState) {
      return;
    }

    const storage = getBrowserStorage();
    if (storage && writeStoredBoardState(storage, state)) {
      lastPersistedState.current = serializedState;
    }
  }, [hydrated, state]);

  useEffect(() => {
    const storage = getBrowserStorage();
    const storedState = storage ? readStoredBoardState(storage) : null;
    const hydratedState = storedState ?? initialBoardState;

    lastPersistedState.current = JSON.stringify(hydratedState);
    providerDispatch({ type: "REPLACE_BOARD", state: hydratedState });

    if (!storage) {
      return;
    }
    const availableStorage = storage;

    function handleStorage(event: StorageEvent) {
      const nextState = getBoardStateFromStorageEvent(
        event,
        availableStorage,
      );

      if (nextState === undefined) {
        return;
      }

      lastPersistedState.current = JSON.stringify(nextState);
      providerDispatch({ type: "REPLACE_BOARD", state: nextState });
    }

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const dispatch: Dispatch<BoardAction> = providerDispatch;

  return (
    <BoardContext.Provider value={{ state, dispatch }}>
      {children}
    </BoardContext.Provider>
  );
}

export function useBoard() {
  const context = useContext(BoardContext);
  if (!context) {
    throw new Error("useBoard must be used within a BoardProvider");
  }
  return context;
}
