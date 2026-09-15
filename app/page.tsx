import { BoardProvider } from "@/board/board-context";
import { Board } from "@/components/board";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-black">
      <header className="border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Product Builder To The Moon
        </h1>
      </header>
      <BoardProvider>
        <Board />
      </BoardProvider>
    </div>
  );
}
