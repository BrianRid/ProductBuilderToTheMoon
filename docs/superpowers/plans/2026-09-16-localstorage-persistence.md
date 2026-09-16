# LocalStorage Persistence Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Persist the complete Kanban board state in `localStorage`, restore it safely after mount, and synchronize valid updates between browser tabs.

**Architecture:** `board/board-context.tsx` owns a provider-level reducer that delegates domain actions to `boardReducer` and handles one private replacement action for hydration and cross-tab updates. Small exported helpers validate, read, and write storage data; effects hydrate once, persist only after hydration, and subscribe to `storage` events without echoing received values.

**Tech Stack:** Next.js 16.3.5, React 19.2.8, TypeScript 5, browser Web Storage API, Node.js built-in test runner.

**Spec:** `docs/specs/2026-09-16-persistance-localstorage.md`

## Global Constraints

- Use the storage key `product-builder-to-the-moon:board`.
- Modify production behavior only in `board/board-context.tsx`.
- Do not modify `board/types.ts`, `board/reducer.ts`, or UI components.
- Add no npm dependency and no test framework.
- Invalid or inaccessible storage must fall back safely without breaking the board.
- Cross-tab synchronization is last-write-wins; do not merge concurrent edits.
- Keep the initial-state flash accepted by the spec.

---

### Task 1: Persisted board provider

**Files:**
- Modify: `board/board-context.tsx`
- Create: `board/board-context.test.ts`

**Interfaces:**
- Consumes: `boardReducer(state: BoardState, action: BoardAction): BoardState`, `initialBoardState`, `BoardState`, and `BoardAction`.
- Produces: `BOARD_STORAGE_KEY`, `parseStoredBoardState(value: string | null): BoardState | null`, `readStoredBoardState(storage: Pick<Storage, "getItem">): BoardState | null`, `writeStoredBoardState(storage: Pick<Storage, "setItem">, state: BoardState): boolean`, and the unchanged `BoardProvider`/`useBoard` public API.

- [x] **Step 1: Write failing validation and storage-boundary tests**

Create `board/board-context.test.ts` with Node's built-in `node:test` and `node:assert/strict`. Cover literal fixtures for a valid board, malformed JSON, missing/invalid cards, blank identifiers/titles, invalid columns, read failures, and write failures. Each test imports the real helpers from `board-context.tsx`; a removed validation branch or removed `try/catch` must make at least one test fail.

```ts
import assert from "node:assert/strict";
import test from "node:test";
import {
  BOARD_STORAGE_KEY,
  parseStoredBoardState,
  readStoredBoardState,
  writeStoredBoardState,
} from "./board-context";
import type { BoardState } from "./types";

const validState: BoardState = {
  cards: [{ id: "card-1", title: "Ship it", columnId: "done" }],
};

test("parses a valid board state", () => {
  assert.deepEqual(parseStoredBoardState(JSON.stringify(validState)), validState);
});

test("rejects malformed or incompatible board states", () => {
  for (const value of [
    "{",
    "null",
    JSON.stringify({}),
    JSON.stringify({ cards: "not-an-array" }),
    JSON.stringify({ cards: [{ id: "", title: "Ship it", columnId: "done" }] }),
    JSON.stringify({ cards: [{ id: "card-1", title: " ", columnId: "done" }] }),
    JSON.stringify({ cards: [{ id: "card-1", title: "Ship it", columnId: "blocked" }] }),
  ]) {
    assert.equal(parseStoredBoardState(value), null);
  }
});

test("storage failures fall back without throwing", () => {
  assert.equal(readStoredBoardState({ getItem: () => { throw new Error("blocked"); } }), null);
  assert.equal(
    writeStoredBoardState({ setItem: () => { throw new Error("full"); } }, validState),
    false,
  );
});

test("writes the complete board under the agreed key", () => {
  let entry: [string, string] | undefined;
  const result = writeStoredBoardState(
    { setItem: (key, value) => { entry = [key, value]; } },
    validState,
  );
  assert.equal(result, true);
  assert.deepEqual(entry, [BOARD_STORAGE_KEY, JSON.stringify(validState)]);
});
```

- [x] **Step 2: Compile and run the tests to verify RED**

Run:

```bash
rm -rf /tmp/product-builder-localstorage-tests
npx tsc board/board-context.tsx board/board-context.test.ts board/reducer.ts board/types.ts \
  --outDir /tmp/product-builder-localstorage-tests \
  --jsx react-jsx --module commonjs --target es2022 --esModuleInterop --skipLibCheck
NODE_PATH="$PWD/node_modules" node --test /tmp/product-builder-localstorage-tests/board/board-context.test.js
```

Expected: TypeScript fails because the four storage exports do not exist yet. This is the required RED signal.

- [x] **Step 3: Implement validation and safe storage helpers**

In `board/board-context.tsx`, add the key, structural guards, and safe boundaries:

```ts
export const BOARD_STORAGE_KEY = "product-builder-to-the-moon:board";

const COLUMN_IDS = new Set(["todo", "in-progress", "done"]);

export function parseStoredBoardState(value: string | null): BoardState | null {
  if (value === null) return null;
  try {
    const candidate: unknown = JSON.parse(value);
    if (
      typeof candidate !== "object" ||
      candidate === null ||
      !("cards" in candidate) ||
      !Array.isArray(candidate.cards) ||
      !candidate.cards.every(isValidCard)
    ) return null;
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
```

`isValidCard` checks a non-blank string `id`, a non-blank string `title`, and membership of `columnId` in `COLUMN_IDS`.

- [x] **Step 4: Run the focused tests to verify GREEN**

Run the same TypeScript compilation and `node --test` commands from Step 2.

Expected: all storage helper tests pass with zero failures.

- [x] **Step 5: Write failing reducer and storage-event tests**

Extend the test file with cases proving that the provider reducer delegates `EDIT_CARD`, replaces the whole board for its private action, ignores unrelated storage events, accepts valid same-storage events, rejects invalid values, and maps deletion to `initialBoardState`. Use plain event-shaped objects and an explicit fake storage object so the real transition helpers are exercised without a DOM mock.

```ts
test("the provider reducer delegates domain actions", () => {
  const edited = providerReducer(
    { board: validState, hydrated: true },
    { type: "EDIT_CARD", id: "card-1", title: "Deployed" },
  );
  assert.equal(edited.board.cards[0].title, "Deployed");
});

test("a valid same-storage event replaces the board", () => {
  const storage = {} as Storage;
  assert.deepEqual(
    getBoardStateFromStorageEvent(
      { key: BOARD_STORAGE_KEY, newValue: JSON.stringify(validState), storageArea: storage },
      storage,
    ),
    validState,
  );
});
```

- [x] **Step 6: Run the focused tests to verify RED**

Run the Step 2 commands again.

Expected: TypeScript fails because `providerReducer` and `getBoardStateFromStorageEvent` are not implemented/exported.

- [x] **Step 7: Implement provider hydration, persistence, and cross-tab sync**

Add a provider state `{ board, hydrated }` and private `REPLACE_BOARD` action. `providerReducer` handles that action and delegates every `BoardAction` to `boardReducer`. Add:

```ts
export function getBoardStateFromStorageEvent(
  event: Pick<StorageEvent, "key" | "newValue" | "storageArea">,
  expectedStorage: Storage,
): BoardState | null | undefined {
  if (event.key !== BOARD_STORAGE_KEY || event.storageArea !== expectedStorage) {
    return undefined;
  }
  if (event.newValue === null) return initialBoardState;
  return parseStoredBoardState(event.newValue) ?? undefined;
}
```

In `BoardProvider`, hydrate in a mount effect, persist in an effect gated by `hydrated`, and register/clean up a `storage` listener. Track the last received serialized state in a ref so a cross-tab update is not immediately written back and echoed to the source tab. Obtain `window.localStorage` inside `try/catch` in every effect/listener path because access itself may throw.

- [x] **Step 8: Run focused tests, lint, and build**

Run:

```bash
rm -rf /tmp/product-builder-localstorage-tests
npx tsc board/board-context.tsx board/board-context.test.ts board/reducer.ts board/types.ts \
  --outDir /tmp/product-builder-localstorage-tests \
  --jsx react-jsx --module commonjs --target es2022 --esModuleInterop --skipLibCheck
NODE_PATH="$PWD/node_modules" node --test /tmp/product-builder-localstorage-tests/board/board-context.test.js
npm run lint
npx next build --webpack
```

Expected: focused tests pass, ESLint reports no errors, and the production build succeeds.

- [x] **Step 9: Run the seven manual browser scenarios from the spec**

Start `npm run dev`, then verify persistence after reload, two-tab propagation, last-write-wins, malformed JSON fallback, invalid card fallback, deletion reset, and unavailable-storage resilience. Record each observed result for the final test report.

- [x] **Step 10: Commit the verified implementation**

```bash
git add board/board-context.tsx board/board-context.test.ts docs/superpowers/plans/2026-09-16-localstorage-persistence.md
git commit -m "feat: persist board state locally"
```
