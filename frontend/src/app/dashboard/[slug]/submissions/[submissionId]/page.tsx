"use client";

import { useEffect, useState, use } from "react";
import { API_BASE } from "@/lib/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
    fetch(`${API_BASE}/student/submissions/${submissionId}/detail`)
      .then((res) => res.json())
      .then(setData);
  }, [submissionId]);

  if (!data)
    return (
      <div className="flex items-center justify-center h-screen">
        Loading result...
      </div>
    );
const greenBadge="bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300";
const worngBadge="bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300";
  // 👉 Show only attempted questions
  const attemptedQuestions = data.questions.filter(
    (q) => q.selected_options.length > 0
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-8">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            {data.test_title}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-between items-center">
          <p className="text-lg font-medium">
            Score: {data.score} / {data.total}
          </p>

          <Badge variant="outline">
            Attempted: {attemptedQuestions.length} / {data.total}
          </Badge>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardContent className="flex gap-6 text-sm">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 bg-green-100 border border-green-500 rounded" />
            Correct Answer Selected
          </div>

          <div className="flex items-center gap-2">
            <span className="w-4 h-4 bg-red-100 border border-red-500 rounded" />
            Wrong Answer Selected
          </div>

          <div className="flex items-center gap-2">
            <span className="w-4 h-4 bg-blue-100 border border-blue-500 rounded" />
            Correct Answer (Missed)
          </div>
        </CardContent>
      </Card>

      {/* Questions */}
      {attemptedQuestions.map((q, idx) => {
        const isFullyCorrect =
          JSON.stringify([...q.selected_options].sort()) ===
          JSON.stringify([...q.correct_options].sort());

        return (
          <Card key={q.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-base">
                <span>
                  {idx + 1}. {q.question_text}
                </span>

                <Badge
                  className={isFullyCorrect ? greenBadge : worngBadge}
                >
                  {isFullyCorrect ? "Correct" : "Wrong"}
                </Badge>
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-2">
              {q.options.map((opt, i) => {
                const isCorrect = q.correct_options.includes(i);
                const isSelected = q.selected_options.includes(i);

                let style = "";

                // Correct selected
                if (isSelected && isCorrect)
                  style =
                    "bg-green-100 border-green-500 border";

                // Wrong selected
                else if (isSelected && !isCorrect)
                  style =
                    "bg-red-100 border-red-500 border";

                // Correct but not selected
                else if (!isSelected && isCorrect)
                  style =
                    "bg-blue-100 border-blue-500 border";

                return (
                  <div
                    key={i}
                    className={`px-3 py-2 rounded-md text-sm ${style}`}
                  >
                    {opt}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        );
      })}

      {attemptedQuestions.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            No questions were attempted.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
