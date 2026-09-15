"use client";

import { useBoard } from "@/board/board-context";
import type { ColumnId } from "@/board/types";
import { Column } from "./column";

const COLUMNS: { id: ColumnId; title: string }[] = [
  { id: "todo", title: "To Do" },
  { id: "in-progress", title: "In Progress" },
  { id: "done", title: "Done" },
];

export function Board() {
  const { state } = useBoard();

  return (
    <div className="flex flex-1 gap-4 overflow-x-auto p-6">
      {COLUMNS.map((column) => (
        <Column
          key={column.id}
          title={column.title}
          cards={state.cards.filter((card) => card.columnId === column.id)}
        />
      ))}
    </div>
  );
}
