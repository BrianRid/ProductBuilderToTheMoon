import { BoardProvider } from "@/board/board-context";
import { Board } from "@/components/board";
import { StatusPill } from "@/components/status-pill";

export default function Home() {
  return (
    <BoardProvider>
      <div className="flex min-h-screen flex-col border-t-2 border-signal">
        <header className="flex items-center justify-between border-b border-line px-6 py-4">
          <h1 className="text-base font-semibold text-paper">
            Product Builder To The Moon
          </h1>
          <StatusPill />
        </header>
        <Board />
      </div>
    </BoardProvider>
  );
}
