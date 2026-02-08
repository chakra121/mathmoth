"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function CreateTestPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState(30);

  async function createTest() {
    const res = await fetch(`${API_BASE}/admin/tests`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        duration: duration * 60,
      }),
    });

    const data = await res.json();
    router.push(`/admin/dashboard/tests/${data.id}`);
  }

  return (
    <div className="space-y-4 max-w-md">
      <h2 className="text-2xl font-semibold">Create Test</h2>

      <div>
        <Label>Title</Label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>

      <div>
        <Label>Duration (minutes)</Label>
        <Input
          type="number"
          value={duration}
          onChange={(e) => setDuration(Number(e.target.value))}
        />
      </div>

      <Button onClick={createTest} className="w-full">
        Create & Continue
      </Button>
    </div>
  );
}
