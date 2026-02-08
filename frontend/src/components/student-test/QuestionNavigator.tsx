"use client";

import { Button } from "@/components/ui/button";

export function QuestionNavigator({
  total,
  current,
  answered,
  onSelect,
}: {
  total: number;
  current: number;
  answered: number[];
  onSelect: (i: number) => void;
}) {
  return (
    <div className="w-30 border-r p-2 space-y-2">
      {Array.from({ length: total }).map((_, i) => (
        <Button
          key={i}
          size="lg"
          variant={
            i === current
              ? "default"
              : answered.includes(i)
              ? "secondary"
              : "outline"
          }
          className="w-full"
          onClick={() => onSelect(i)}
        >
          Q {i + 1}
        </Button>
      ))}
    </div>
  );
}
