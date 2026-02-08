"use client";

import { use } from "react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { API_BASE } from "@/lib/api";
import { PreCheckScreen } from "@/components/student-test/PreCheckScreen";
import { QuestionNavigator } from "@/components/student-test/QuestionNavigator";
import { QuestionView } from "@/components/student-test/QuestionView";
import { TimerBar } from "@/components/student-test/TimerBar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

export default function StudentTestAttempt({
  params,
}: {
  params: Promise<{ testId: string }>;
}) {
  // ✅ FIX HERE
  const { testId } = use(params);

  const { data: session } = useSession();

  const [ready, setReady] = useState(false);
  const [test, setTest] = useState<{ questions: Array<{ id: string; question_type: string; order: number; question_text: string; options: string[] }>; duration: number } | null>(null);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number[]>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [warn, setWarn] = useState(false);

  /* fetch test after pre-check */
  useEffect(() => {
    if (!ready) return;

    fetch(`${API_BASE}/student/tests/${testId}`)
      .then((r) => r.json())
      .then((t) => {
        setTest(t);
        setTimeLeft(t.duration);
      });
  }, [ready, testId]);

  /* timer */
  useEffect(() => {
    if (!ready || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [ready, timeLeft]);

  async function submit() {
    await fetch(`${API_BASE}/student/tests/${testId}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        student_id: session?.user?.id,
        answers,
      }),
    });

    window.location.href = `/dashboard/${session?.user?.slug}/submissions`;
  }

  if (!ready) {
    return <PreCheckScreen onReady={() => setReady(true)} />;
  }

  if (!test) return null;

  const question = test.questions[index];

  return (
    <div className=" flex">
      <QuestionNavigator
        total={test.questions.length}
        current={index}
        answered={Object.keys(answers).map((qid) =>
          test.questions.findIndex((q: { id: string; question_type: string; [key: string]: unknown }) => q.id === qid),
        )}
        onSelect={setIndex}
      />

      <div className="flex-1 p-8 overflow-y-auto">
        <TimerBar
          timeLeft={timeLeft}
          onWarn={() => setWarn(true)}
          onTimeout={submit}
        />

        <QuestionView
          question={question}
          answer={answers[question.id]}
          onChange={(i: number) =>
            setAnswers((prev) => ({
              ...prev,
              [question.id]:
                question.question_type === "multiple"
                  ? prev[question.id]?.includes(i)
                    ? prev[question.id].filter((x) => x !== i)
                    : [...(prev[question.id] || []), i]
                  : [i],
            }))
          }
          onClear={() =>
            setAnswers((prev) => {
              const copy = { ...prev };
              delete copy[question.id];
              return copy;
            })
          }
        />

        <Button className="mt-8" onClick={submit}>
          Submit Test
        </Button>
      </div>

      <Dialog open={warn} onOpenChange={setWarn}>
        <DialogContent className="max-w-sm">
          {/* Accessibility-required title */}
          <VisuallyHidden>
            <DialogTitle>Time Warning</DialogTitle>
          </VisuallyHidden>

          <div className="text-center space-y-4">
            <p className="text-lg font-semibold text-red-600">
              1 Minute Remaining
            </p>

            <p className="text-sm text-muted-foreground">
              Your test will be auto-submitted when time runs out.
            </p>

            {/* Explicit close button (best UX) */}
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setWarn(false)}
            >
              Continue Test
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
