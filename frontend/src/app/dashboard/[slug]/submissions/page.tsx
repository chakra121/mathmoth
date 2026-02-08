"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { API_BASE } from "@/lib/api";
import { Button } from "@/components/ui/button";

type Submission = {
  id: string;
  test_title: string;
  score: number;
  total: number;
  attempt: number;
  submitted_at: string;
};

export default function SubmissionsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { data: session } = useSession();
  const [subs, setSubs] = useState<Submission[]>([]);

  useEffect(() => {
    if (!session?.user?.id) return;

    fetch(
      `${API_BASE}/student/submissions/${session.user.id}`
    )
      .then((res) => res.json())
      .then(setSubs);
  }, [session]);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">My Submissions</h2>

      {subs.length === 0 && (
        <p className="text-muted-foreground">
          No tests attempted yet.
        </p>
      )}

      {subs.map((s) => (
        <div
          key={s.id}
          className="border rounded p-4 flex justify-between"
        >
          <div>
            <p className="font-medium">{s.test_title}</p>
            <p className="text-sm text-muted-foreground">
              Score: {s.score}/{s.total} · Attempt {s.attempt}
            </p>
          </div>

          <Link
            href={`/dashboard/${slug}/submissions/${s.id}`}
          >
            <Button variant="outline">View Result</Button>
          </Link>
        </div>
      ))}
    </div>
  );
}
