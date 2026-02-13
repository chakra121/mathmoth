"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";

interface QuestionViewProps {
  question: {
    question_type: string;
    order: number;
    question_text: string;
    options: string[];
  };
  answer: number[] | null;
  onChange: (index: number) => void;
  onClear: () => void;
}

export function QuestionView({
  question,
  answer,
  onChange,
  onClear,
}: QuestionViewProps) {
  const multiple = question.question_type === "multiple";

  return (
    <div className="max-h-screen space-y-6">
      <h1 className="text-2xl font-semibold">Question {question.order}</h1>
      <h2 className="text-xl font-semibold">
        {question.question_text}
      </h2>

      {multiple ? (
        question.options.map((opt: string, i: number) => (
          <label key={i} className="flex items-center gap-3 text-lg">
            <Checkbox
              checked={answer?.includes(i)}
              onCheckedChange={() => onChange(i)}
            />
            {opt}
          </label>
        ))
      ) : (
        <RadioGroup
          value={answer?.[0]?.toString() ?? ""}
          onValueChange={(v) => onChange(Number(v))}
        >
          {question.options.map((opt: string, i: number) => (
            <label key={i} className="flex items-center gap-3 text-lg">
              <RadioGroupItem value={i.toString()} />
              {opt}
            </label>
          ))}
        </RadioGroup>
      )}

      {answer && (
        <Button variant="outline" onClick={onClear}>
          Clear selection
        </Button>
      )}
    </div>
  );
}
