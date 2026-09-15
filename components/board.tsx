"use client";

import { useBoard } from "@/board/board-context";
import type { ColumnId } from "@/board/types";
import { Column } from "./column";

const COLUMNS: { id: ColumnId; title: string; indicatorClassName: string }[] = [
  { id: "todo", title: "To Do", indicatorClassName: "bg-line" },
  { id: "in-progress", title: "In Progress", indicatorClassName: "bg-signal" },
  { id: "done", title: "Done", indicatorClassName: "bg-complete" },
];

export function Board() {
  const { state } = useBoard();

  return (
    <div className="flex flex-1 gap-px overflow-x-auto bg-line">
      {COLUMNS.map((column) => (
        <Column
          key={column.id}
          title={column.title}
          indicatorClassName={column.indicatorClassName}
          cards={state.cards.filter((card) => card.columnId === column.id)}
        />
      ))}
    </div>
  );
}
