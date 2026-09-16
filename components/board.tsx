"use client";

import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { useBoard } from "@/board/board-context";
import type { ColumnId } from "@/board/types";
import { Column } from "./column";
import { CardOverlay } from "./card";
import { SearchBar } from "./search-bar";

const COLUMNS: { id: ColumnId; title: string; indicatorClassName: string }[] = [
  { id: "todo", title: "To Do", indicatorClassName: "bg-line" },
  { id: "in-progress", title: "In Progress", indicatorClassName: "bg-signal" },
  { id: "done", title: "Done", indicatorClassName: "bg-complete" },
];

export function Board() {
  const { state, dispatch } = useBoard();
  const [query, setQuery] = useState("");
  const [activeCardId, setActiveCardId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const search = query.trim().toLowerCase();
  const visibleCards = search
    ? state.cards.filter((card) => card.title.toLowerCase().includes(search))
    : state.cards;

  const activeCard = state.cards.find((card) => card.id === activeCardId) ?? null;

  function handleDragStart(event: DragStartEvent) {
    setActiveCardId(String(event.active.id));
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over) {
      dispatch({
        type: "MOVE_CARD",
        cardId: String(active.id),
        targetColumnId: over.id as ColumnId,
      });
    }
    setActiveCardId(null);
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveCardId(null)}
    >
      <div className="flex flex-1 flex-col">
        <SearchBar value={query} onChange={setQuery} />
        {search && visibleCards.length === 0 && (
          <p className="px-6 py-3 text-sm text-paper-dim">
            Aucune carte ne correspond à « {query.trim()} ».
          </p>
        )}
        <div className="flex flex-1 gap-px overflow-x-auto bg-line">
          {COLUMNS.map((column) => (
            <Column
              key={column.id}
              id={column.id}
              title={column.title}
              indicatorClassName={column.indicatorClassName}
              cards={visibleCards.filter((card) => card.columnId === column.id)}
            />
          ))}
        </div>
      </div>
      <DragOverlay>
        {activeCard ? <CardOverlay card={activeCard} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
