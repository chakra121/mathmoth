"use client";

import { useEffect, useState, use } from "react";
import { API_BASE } from "@/lib/api";

interface SubmissionData {
  test_title: string;
  score: number;
  total: number;
  questions: Array<{
    id: string;
    question_text: string;
    options: string[];
    correct_options: number[];
    selected_options: number[];
  }>;
}

export default function SubmissionDetail({
  params,
}: {
  params: Promise<{ submissionId: string }>;
}) {
  const { submissionId } = use(params);
  const [data, setData] = useState<SubmissionData | null>(null);

  useEffect(() => {
    fetch(
      `${API_BASE}/student/submissions/${submissionId}/detail`
    )
      .then((res) => res.json())
      .then(setData);
  }, [submissionId]);

  if (!data) return <p>Loading result...</p>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">
        {data.test_title}
      </h2>

      <p className="text-lg">
        Score: <b>{data.score}</b> / {data.total}
      </p>

      {data.questions.map((q, idx: number) => (
        <div
          key={q.id}
          className="border rounded p-4 space-y-2"
        >
          <p className="font-medium">
            {idx + 1}. {q.question_text}
          </p>

          <ul className="space-y-1">
            {q.options.map((opt: string, i: number) => {
              const isCorrect =
                q.correct_options.includes(i);
              const isSelected =
                q.selected_options.includes(i);

              return (
                <li
                  key={i}
                  className={`px-2 py-1 rounded text-sm ${
                    isCorrect
                      ? "bg-green-100"
                      : isSelected
                      ? "bg-red-100"
                      : ""
                  }`}
                >
                  {opt}
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}
