"use client";

import { useEffect, useState, use, useCallback } from "react";
import { API_BASE } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

type Question = {
  id: string;
  question_text: string;
  options: string[];
  correct_options: number[];
  order: number;
  question_type: "single" | "multiple";
};

export default function ManageQuestionsPage({
  params,
}: {
  params: Promise<{ testId: string }>;
}) {
  const { testId } = use(params);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [text, setText] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correct, setCorrect] = useState<number[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchQuestions = useCallback(async () => {
    const res = await fetch(`${API_BASE}/admin/tests/${testId}/questions`);
    const data = await res.json();

    data.sort((a: Question, b: Question) => a.order - b.order);

    setQuestions(data);
  }, [testId]);

  async function addQuestion() {
    if (!text || options.some((o) => !o)) return;

    await fetch(`${API_BASE}/admin/tests/${testId}/questions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question_text: text,
        options,
        correct_options: correct,
        order: questions.length + 1,
        question_type: correct.length > 1 ? "multiple" : "single",
      }),
    });

    resetForm();
    fetchQuestions();
  }

  async function updateQuestion(q: Question) {
    await fetch(`${API_BASE}/admin/questions/${q.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(q),
    });

    setEditingId(null);
    fetchQuestions();
  }

  async function deleteQuestion(id: string) {
    if (!confirm("Delete this question?")) return;

    await fetch(`${API_BASE}/admin/questions/${id}`, {
      method: "DELETE",
    });

    fetchQuestions();
  }

  function moveQuestion(index: number, direction: number) {
    const target = index + direction;
    if (target < 0 || target >= questions.length) return;

    const reordered = [...questions];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(target, 0, moved);

    // normalize order locally
    const normalized = reordered.map((q, i) => ({
      ...q,
      order: i + 1,
    }));

    setQuestions(normalized);
  }

  async function saveOrder() {
    await fetch(`${API_BASE}/admin/tests/${testId}/questions/reorder`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        questions.map((q) => ({
          id: q.id,
          order: q.order,
        })),
      ),
    });

    alert("Order saved successfully");
    fetchQuestions(); // re-sync from DB
  }

  function resetForm() {
    setText("");
    setOptions(["", "", "", ""]);
    setCorrect([]);
  }

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Questions</h2>
        <Button
          variant="secondary"
          onClick={saveOrder}
          disabled={questions.length === 0}
        >
          Save Order
        </Button>
      </div>

      {/* Existing questions */}
      {questions.map((q, index) => (
        <div key={q.id} className="border rounded p-4 space-y-2">
          {editingId === q.id ? (
            <>
              <Input
                value={q.question_text}
                onChange={(e) =>
                  setQuestions((prev) =>
                    prev.map((x) =>
                      x.id === q.id
                        ? { ...x, question_text: e.target.value }
                        : x,
                    ),
                  )
                }
              />

              {q.options.map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Checkbox
                    checked={q.correct_options.includes(i)}
                    onCheckedChange={() =>
                      setQuestions((prev) =>
                        prev.map((x) =>
                          x.id === q.id
                            ? {
                                ...x,
                                correct_options: x.correct_options.includes(i)
                                  ? x.correct_options.filter((v) => v !== i)
                                  : [...x.correct_options, i],
                              }
                            : x,
                        ),
                      )
                    }
                  />
                  <Input
                    value={opt}
                    onChange={(e) =>
                      setQuestions((prev) =>
                        prev.map((x) =>
                          x.id === q.id
                            ? {
                                ...x,
                                options: x.options.map((o, oi) =>
                                  oi === i ? e.target.value : o,
                                ),
                              }
                            : x,
                        ),
                      )
                    }
                  />
                </div>
              ))}

              <Button onClick={() => updateQuestion(q)}>Save</Button>
            </>
          ) : (
            <>
              <p className="font-medium">
                {q.order}. {q.question_text}
              </p>

              <ul className="ml-5 text-sm list-disc">
                {q.options.map((opt, i) => (
                  <li key={i}>
                    {opt} {q.correct_options.includes(i) && "✅"}
                  </li>
                ))}
              </ul>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setEditingId(q.id)}
                >
                  Edit
                </Button>

                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => deleteQuestion(q.id)}
                >
                  Delete
                </Button>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => moveQuestion(index, -1)}
                >
                  ↑
                </Button>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => moveQuestion(index, 1)}
                >
                  ↓
                </Button>
              </div>
            </>
          )}
        </div>
      ))}

      {/* Add new question */}
      <div className="border-t pt-4 space-y-3">
        <Input
          placeholder="New question"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        {options.map((opt, i) => (
          <div key={i} className="flex items-center gap-2">
            <Checkbox
              checked={correct.includes(i)}
              onCheckedChange={() =>
                setCorrect((prev) =>
                  prev.includes(i) ? prev.filter((v) => v !== i) : [...prev, i],
                )
              }
            />
            <Input
              placeholder={`Option ${i + 1}`}
              value={opt}
              onChange={(e) => {
                const updated = [...options];
                updated[i] = e.target.value;
                setOptions(updated);
              }}
            />
          </div>
        ))}

        <Button onClick={addQuestion}>Add Question</Button>
      </div>
    </div>
  );
}
