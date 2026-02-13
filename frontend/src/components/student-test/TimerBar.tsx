"use client";

import { useEffect } from "react";

export function TimerBar({
  timeLeft,
  onTimeout,
  onWarn,
}: {
  timeLeft: number;
  onTimeout: () => void;
  onWarn: () => void;
}) {
  useEffect(() => {
    if (timeLeft === 60) onWarn();
    if (timeLeft === 0) onTimeout();
  }, [onTimeout, onWarn, timeLeft]);

  return (
    <div className="min-h-screen fixed top-4 right-6 font-mono text-2xl">
      ⏱️ {Math.floor(timeLeft / 60)}:
      {(timeLeft % 60).toString().padStart(2, "0")}
    </div>
  );
}
