import assert from "node:assert/strict";
import test from "node:test";
import {
  BOARD_STORAGE_KEY,
  getBrowserStorage,
  getBoardStateFromStorageEvent,
  parseStoredBoardState,
  providerReducer,
  readStoredBoardState,
  writeStoredBoardState,
} from "./board-context";
import { initialBoardState } from "./reducer";
import type { BoardState } from "./types";

const validState: BoardState = {
  cards: [{ id: "card-1", title: "Ship it", columnId: "done" }],
};

test("parses a valid board state", () => {
  assert.deepEqual(parseStoredBoardState(JSON.stringify(validState)), validState);
});

test("returns null when storage has no board", () => {
  assert.equal(parseStoredBoardState(null), null);
});

test("rejects malformed or incompatible board states", () => {
  const invalidValues = [
    "{",
    "null",
    JSON.stringify({}),
    JSON.stringify({ cards: "not-an-array" }),
    JSON.stringify({
      cards: [{ id: "", title: "Ship it", columnId: "done" }],
    }),
    JSON.stringify({
      cards: [{ id: "card-1", title: " ", columnId: "done" }],
    }),
    JSON.stringify({
      cards: [{ id: "card-1", title: "Ship it", columnId: "blocked" }],
    }),
  ];

  for (const value of invalidValues) {
    assert.equal(parseStoredBoardState(value), null, value);
  }
});

test("reads the agreed key and returns a valid stored board", () => {
  let requestedKey = "";
  const state = readStoredBoardState({
    getItem(key) {
      requestedKey = key;
      return JSON.stringify(validState);
    },
  });

  assert.equal(requestedKey, BOARD_STORAGE_KEY);
  assert.deepEqual(state, validState);
});

test("returns null when reading storage throws", () => {
  assert.equal(
    readStoredBoardState({
      getItem() {
        throw new Error("blocked");
      },
    }),
    null,
  );
});

test("writes the complete board under the agreed key", () => {
  let entry: [string, string] | undefined;
  const result = writeStoredBoardState(
    {
      setItem(key, value) {
        entry = [key, value];
      },
    },
    validState,
  );

  assert.equal(result, true);
  assert.deepEqual(entry, [BOARD_STORAGE_KEY, JSON.stringify(validState)]);
});

test("returns false when writing storage throws", () => {
  assert.equal(
    writeStoredBoardState(
      {
        setItem() {
          throw new Error("full");
        },
      },
      validState,
    ),
    false,
  );
});

test("returns null when browser storage access is blocked", () => {
  const blockedWindow = {
    get localStorage(): Storage {
      throw new Error("blocked");
    },
  };

  assert.equal(getBrowserStorage(blockedWindow), null);
});

test("the provider reducer delegates domain actions", () => {
  const result = providerReducer(
    { board: validState, hydrated: true },
    { type: "EDIT_CARD", id: "card-1", title: "Deployed" },
  );

  assert.equal(result.board.cards[0].title, "Deployed");
  assert.equal(result.hydrated, true);
});

test("the provider reducer replaces the complete board during hydration", () => {
  const result = providerReducer(
    { board: initialBoardState, hydrated: false },
    { type: "REPLACE_BOARD", state: validState },
  );

  assert.deepEqual(result, { board: validState, hydrated: true });
});

test("a valid event from the same storage returns its board", () => {
  const storage = {} as Storage;

  assert.deepEqual(
    getBoardStateFromStorageEvent(
      {
        key: BOARD_STORAGE_KEY,
        newValue: JSON.stringify(validState),
        storageArea: storage,
      },
      storage,
    ),
    validState,
  );
});

test("deleting the key from the same storage returns the initial board", () => {
  const storage = {} as Storage;

  assert.deepEqual(
    getBoardStateFromStorageEvent(
      { key: BOARD_STORAGE_KEY, newValue: null, storageArea: storage },
      storage,
    ),
    initialBoardState,
  );
});

test("unrelated and invalid storage events are ignored", () => {
  const storage = {} as Storage;
  const otherStorage = {} as Storage;

  assert.equal(
    getBoardStateFromStorageEvent(
      { key: "another-key", newValue: JSON.stringify(validState), storageArea: storage },
      storage,
    ),
    undefined,
  );
  assert.equal(
    getBoardStateFromStorageEvent(
      {
        key: BOARD_STORAGE_KEY,
        newValue: JSON.stringify(validState),
        storageArea: otherStorage,
      },
      storage,
    ),
    undefined,
  );
  assert.equal(
    getBoardStateFromStorageEvent(
      { key: BOARD_STORAGE_KEY, newValue: "{", storageArea: storage },
      storage,
    ),
    undefined,
  );
});
