# Feature Spec: Drag & Drop Between Columns

- **Feature:** #1 in WORKSHOP.md
- **Branch:** `feature/xavier-drag-and-drop`
- **Date:** 2026-09-16
- **Status:** Approved for implementation

## Overview

Cards can be dragged from one column to another (To Do / In Progress /
Done) using mouse or touch pointer input. This is the only workshop
feature that adds a case to `BoardAction`/`boardReducer` purely for
moving a card's column — no new fields are added to `Card`.

## Scope

**In scope:**
- Dragging a card and dropping it on a different column moves it there.
- Dropping back on the origin column is a no-op.
- Visual feedback for pick-up, drag, valid drop target, and cancel.

**Out of scope (explicitly deferred):**
- Reordering cards within a column. `Card` has no `order`/`position`
  field and none is added by this feature; cards keep rendering in
  their existing array order.
- Keyboard/screen-reader operable dragging. Pointer input
  (mouse/touch) only.
- Any drag handle UI — the whole card is the draggable surface.

## Library

**`@dnd-kit/core`** (as suggested in WORKSHOP.md's feature table).

Rejected alternatives:
- **Native HTML5 Drag and Drop API** — inconsistent cross-browser drag
  image styling, poor touch support.
- **`react-beautiful-dnd`** — unmaintained, incompatible with React 19.

Only `@dnd-kit/core` is needed (not `@dnd-kit/sortable`), since there
is no within-column ordering to manage — cards use `useDraggable`,
columns use `useDroppable`.

## Data model & reducer

No changes to `Card` or `BoardState`. One new `BoardAction` variant:

```ts
{ type: "MOVE_CARD"; cardId: string; targetColumnId: ColumnId }
```

Reducer behavior: find the card by `cardId`, return a new state with
that card's `columnId` set to `targetColumnId`. Dropping on the same
column produces a new object reference with the same `columnId` —
harmless, no guard needed.

## Interaction & visual states

Referencing DESIGN.md's existing vocabulary (`Module Rest` /
`Module Active` shadows, `Launch Amber` as the "active signal" color,
the column's 2px top status bar):

1. **Idle card:** `border-l-2 border-line`, `Module Rest` shadow.
2. **Drag start:** once the pointer passes `@dnd-kit`'s activation
   distance threshold (a few px), the source card switches to
   `Module Active` shadow + `Launch Amber` left border (the existing
   hover state, sustained for the drag). Cursor becomes `grabbing`.
   The activation threshold is what lets the whole card stay
   draggable without swallowing plain clicks (relevant later for
   features #3/#4).
3. **While dragging:** a `DragOverlay` renders a floating copy of the
   card at the pointer, same size, `Module Active` shadow. The card's
   original slot in its source column drops to `opacity-40` in place
   — no reflow or placeholder gap, since within-column order isn't
   tracked.
4. **Drag over a column:** that column's 2px top status bar switches
   to `Launch Amber` for as long as the pointer is over it; reverts
   when the pointer leaves.
5. **Drop on a valid column (including the origin column):**
   `MOVE_CARD` is dispatched with the target column's id. The overlay
   animates into its resting position in the (possibly new) column.
6. **Drop outside any column, or cancel (e.g. Escape):** `@dnd-kit`'s
   default cancel behavior — overlay animates back to the origin, no
   action dispatched, no error state to show.

## Edge cases

- **Drop on the same column:** allowed, no-op result (see reducer
  above).
- **Empty column as drop target:** still droppable; existing
  `min-w-[240px]` flex layout handles an empty stack, drop-target
  amber bar still activates on hover.
- **Overlapping/rapid drags:** not a concern — `@dnd-kit` tracks one
  active drag at a time, and pointer input is single-cursor/single-touch.

## Files touched

- `board/types.ts` — add `MOVE_CARD` to `BoardAction`.
- `board/reducer.ts` — add `case "MOVE_CARD"`.
- `components/board.tsx` — wrap columns in `DndContext`, handle
  `onDragEnd` to dispatch `MOVE_CARD`.
- `components/column.tsx` — `useDroppable`, apply the amber top-bar
  state when it's the active drop target.
- `components/card.tsx` — `useDraggable`, apply drag-active visual
  state, render inside `DragOverlay`.
- `package.json` — add `@dnd-kit/core` dependency.

## Verification plan

No test framework exists in this repo; WORKSHOP.md's CI gate is
`lint` + `build`.

- `npm run lint` and `npm run build` pass.
- Manual browser pass: drag a card between all 3 columns, drag a card
  back onto its own column, start a drag and release outside the
  board — confirm visual states at each step (idle → lift → drop-target
  amber bar → drop or cancel).
