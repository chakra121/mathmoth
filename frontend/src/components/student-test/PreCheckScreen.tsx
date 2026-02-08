"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import { API_BASE } from "@/lib/api";

export function PreCheckScreen({
  onReady,
}: {
  onReady: () => void;
}) {
  const [internet, setInternet] = useState<"checking" | "ok" | "fail">("checking");
  const [backend, setBackend] = useState<"checking" | "ok" | "fail">("checking");

  useEffect(() => {
    // Internet check
    setTimeout(() => {
      setInternet(navigator.onLine ? "ok" : "fail");
    }, 800);

    // Backend check
    fetch(`${API_BASE}/health`)
      .then(() => setBackend("ok"))
      .catch(() => setBackend("fail"));
  }, []);

  const ready = internet === "ok" && backend === "ok";

  return (
    <div className="flex items-center justify-center bg-background">
      <Card className="w-[420px] p-6 space-y-4">
        <h2 className="text-xl font-bold text-center">System Check</h2>

        <CheckRow label="Internet connection" status={internet} />
        <CheckRow label="Backend reachable" status={backend} />

        <Button disabled={!ready} onClick={onReady} className="w-full">
          Start Test
        </Button>
      </Card>
    </div>
  );
}

function CheckRow({
  label,
  status,
}: {
  label: string;
  status: "checking" | "ok" | "fail";
}) {
  return (
    <div className="flex items-center justify-between">
      <span>{label}</span>
      {status === "checking" && <Loader2 className="animate-spin" />}
      {status === "ok" && <CheckCircle className="text-green-600" />}
      {status === "fail" && <XCircle className="text-red-600" />}
    </div>
  );
}
