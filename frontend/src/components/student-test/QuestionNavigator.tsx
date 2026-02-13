"use client";

import { Button } from "@/components/ui/button";

type Props = {
  total: number;
  current: number;
  answered: number[];
  visited: number[];
  onSelect: (index: number) => void;
  onSubmit: () => void;
};

export function QuestionNavigator({
  total,
  current,
  answered,
  visited,
  onSelect,
  onSubmit,
}: Props) {
  function getColor(i: number) {
    if (i === current) return "bg-white text-black border shadow";
    if (answered.includes(i)) return "bg-green-600 text-white";
    if (visited.includes(i)) return "bg-gray-400 text-white";
    return "bg-black text-white";
  }

  return (
    <div className="w-[300px] max-h-screen rounded-t-2xl border-r flex flex-col bg-neutral-100">
      {/* Header */}
      <div className="p-4 border-b font-semibold ">Questions</div>

      {/* Scrollable Question Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: total }).map((_, i) => (
            <button
              key={i}
              onClick={() => onSelect(i)}
              className={`h-10 rounded-md text-sm font-semibold transition ${getColor(i)}`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Legend + Submit */}
      <div className="p-4 border-t space-y-4 bg-background">
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 bg-black rounded" />
            Not Visited
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 bg-gray-400 rounded" />
            Visited
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 bg-green-600 rounded" />
            Answered
          </div>
        </div>

        <Button className="w-full" onClick={onSubmit}>
          Submit Test
        </Button>
      </div>
    </div>
  );
}
