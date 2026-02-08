"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import Link from "next/link";
import { API_BASE } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type Test = {
  id: string;
  title: string;
  duration: number;
  status: "draft" | "published";
};

export default function AdminTestsPage() {
  /* ---------------- State ---------------- */
  const [tests, setTests] = useState<Test[]>([]);
  const [open, setOpen] = useState(false);

  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState(30);

  /* ---------------- API ---------------- */
  async function fetchTests() {
    const res = await fetch(`${API_BASE}/admin/tests`);
    const data = await res.json();
    setTests(data);
  }

  async function toggleStatus(test: Test) {
    const endpoint =
      test.status === "draft"
        ? `${API_BASE}/admin/tests/${test.id}/publish`
        : `${API_BASE}/admin/tests/${test.id}/draft`;

    await fetch(endpoint, { method: "PATCH" });
    fetchTests();
  }

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

    setOpen(false);
    setTitle("");
    setDuration(30);

    window.location.href = `/admin/dashboard/tests/${data.id}`;
  }

  async function deleteTest(id: string) {
    const ok = confirm(
      "This will permanently delete the test, questions, and submissions. Continue?"
    );
    if (!ok) return;

    await fetch(`${API_BASE}/admin/tests/delete/${id}`, {
      method: "DELETE",
    });

    fetchTests();
  }

  /* ---------------- Effects ---------------- */
  useEffect(() => {
    fetchTests();
  }, []);

  /* ---------------- UI ---------------- */
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Tests</h2>

        {/* Create Test Modal */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Create Test</Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Test</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label className="py-2">Test Title</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter test title"
                />
              </div>

              <div>
                <Label className="py-2">Duration (minutes)</Label>
                <Input
                  type="number"
                  min={1}
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                />
              </div>

              <Button
                className="w-full"
                onClick={createTest}
                disabled={!title || duration <= 0}
              >
                Create & Add Questions
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Empty State */}
      {tests.length === 0 && (
        <p className="text-muted-foreground">No tests created yet.</p>
      )}

      {/* Tests List */}
      {tests.map((test) => (
        <div
          key={test.id}
          className="border rounded p-4 flex justify-between items-center"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <p className="font-medium">{test.title}</p>

              {/* Status Badge */}
              <Badge
                className={
                  test.status === "published"
                    ? "bg-green-600 text-white"
                    : "bg-red-600 text-white"
                }
              >
                {test.status.toUpperCase()}
              </Badge>
            </div>

            <p className="text-sm text-muted-foreground">
              Duration: {test.duration / 60} min
            </p>
          </div>

          <div className="flex gap-2">
            <Link href={`/admin/dashboard/tests/${test.id}`}>
              <Button variant="outline">Manage</Button>
            </Link>

            <Button
              variant="secondary"
              onClick={() => toggleStatus(test)}
            >
              {test.status === "published"
                ? "Move to Draft"
                : "Publish"}
            </Button>

            <Button
              variant="destructive"
              onClick={() => deleteTest(test.id)}
            >
              Delete
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
