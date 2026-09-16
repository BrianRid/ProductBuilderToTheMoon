"use client";

import { useState } from "react";
import { useBoard } from "@/board/board-context";
import type { ColumnId } from "@/board/types";
import { Column } from "./column";
import { SearchBar } from "./search-bar";

const COLUMNS: { id: ColumnId; title: string; indicatorClassName: string }[] = [
  { id: "todo", title: "To Do", indicatorClassName: "bg-line" },
  { id: "in-progress", title: "In Progress", indicatorClassName: "bg-signal" },
  { id: "done", title: "Done", indicatorClassName: "bg-complete" },
];

export function Board() {
  const { state } = useBoard();
  const [query, setQuery] = useState("");

  const search = query.trim().toLowerCase();
  const visibleCards = search
    ? state.cards.filter((card) => card.title.toLowerCase().includes(search))
    : state.cards;

  return (
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
            title={column.title}
            indicatorClassName={column.indicatorClassName}
            cards={visibleCards.filter((card) => card.columnId === column.id)}
          />
        ))}
      </div>
    </div>
  );
}
