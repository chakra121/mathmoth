"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { API_BASE } from "@/lib/api";
import { Button } from "@/components/ui/button";

type Test = {
  id: string;
  title: string;
  duration: number;
};

type TestLink = {
  id: string;
  title: string;
  url: string;
};

export default function TestsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);

  const [tests, setTests] = useState<Test[]>([]);
  const [links, setLinks] = useState<TestLink[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE}/student/tests`).then((res) => res.json()),
      fetch(`${API_BASE}/student/test-links`).then((res) => res.json()),
    ])
      .then(([testsData, linksData]) => {
        setTests(Array.isArray(testsData) ? testsData : []);
        setLinks(Array.isArray(linksData) ? linksData : []);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading tests...</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* =======================
          TEST LINKS (LEFT)
         ======================= */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Test Links</h2>

        {links.length === 0 && (
          <p className="text-muted-foreground">
            No test links available.
          </p>
        )}

        <ul className="space-y-2">
          {links.map((link) => (
            <li
              key={link.id}
              className="border p-4 rounded flex justify-between items-center"
            >
              <div>
                <p className="font-medium">{link.title}</p>
              </div>

              <Link href={link.url} target="_blank">
                <Button>Open Link</Button>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* =======================
          AVAILABLE TESTS (RIGHT)
         ======================= */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Available Tests</h2>

        {tests.length === 0 && (
          <p className="text-muted-foreground">
            No tests available right now.
          </p>
        )}

        <ul className="space-y-2">
          {tests.map((test) => (
            <li
              key={test.id}
              className="border p-4 rounded flex justify-between items-center"
            >
              <div>
                <p className="font-medium">{test.title}</p>
                <p className="text-sm text-muted-foreground">
                  Duration: {test.duration / 60} min
                </p>
              </div>

              <Link href={`/dashboard/${slug}/tests/${test.id}`}>
                <Button>Start Test</Button>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
