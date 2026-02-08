"use client";

import { useEffect, useState, use } from "react";
import { API_BASE } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectItem,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  AreaChart,
  Area,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

type WeeklyReport = {
  test_id: string;
  test_title: string;
  best_score: number;
  total: number;
};

type TestBreakdown = {
  attempts: number;
  best_score: number;
  total: number;
  correct: number;
  wrong: number;
  unanswered: number;
};

export default function StudentReportDetail({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const { studentId } = use(params);

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [weekly, setWeekly] = useState<WeeklyReport[]>([]);
  const [selectedTest, setSelectedTest] = useState("");
  const [breakdown, setBreakdown] = useState<TestBreakdown | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [student, setStudent] = useState<{
    name: string;
    email: string;
  } | null>(null);

  // ─────────── Student Info ───────────
  useEffect(() => {
    fetch(`${API_BASE}/admin/students/${studentId}`)
      .then((res) => res.json())
      .then(setStudent);
  }, [studentId]);

  // ─────────── Report ───────────
  function fetchReport() {
    if (!from || !to) return;

    fetch(
      `${API_BASE}/admin/reports/students/${studentId}?from=${from}&to=${to}`,
    )
      .then((res) => res.json())
      .then((data) => {
        setWeekly(Array.isArray(data) ? data : []);
        setLoaded(true);
        setBreakdown(null);
        setSelectedTest("");
      });
  }

  function fetchBreakdown(testId: string) {
    fetch(`${API_BASE}/admin/reports/students/${studentId}/test/${testId}`)
      .then((res) => res.json())
      .then(setBreakdown);
  }

  const pieData = breakdown
    ? [
        { name: "Correct", value: breakdown.correct },
        { name: "Wrong", value: breakdown.wrong },
        { name: "Unanswered", value: breakdown.unanswered },
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* ─────────── Header ─────────── */}
      <Card>
        <CardHeader>
          <CardTitle>Student Report</CardTitle>
        </CardHeader>

        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: Student Info */}
          <div className="space-y-1">
            <p className="text-lg font-semibold">
              {student?.name ?? "Student"}
            </p>
            <p className="text-sm text-muted-foreground">{student?.email}</p>
            <p className="text-xs text-muted-foreground">
              Best attempt per test is considered
            </p>
          </div>

          {/* Right: Date Filters */}
          <div className="flex flex-wrap gap-4 items-end justify-end">
            <div>
              <label className="text-sm">From</label>
              <Input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm">To</label>
              <Input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
              />
            </div>

            <Button onClick={fetchReport}>Get Report</Button>
          </div>
        </CardContent>
      </Card>

      {/* ─────────── Empty State ─────────── */}
      {!loaded && (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            Select a date range and click <b>Get Report</b>
          </CardContent>
        </Card>
      )}

      {loaded && (
        <>
          {/* ─────────── Charts ─────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Area Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Weekly Performance</CardTitle>
              </CardHeader>
              <CardContent className="h-65">
                {weekly.length === 0 ? (
                  <p className="text-center text-muted-foreground mt-16">
                    No attempts in this period
                  </p>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={weekly}>
                      <XAxis dataKey="test_title" />
                      <Tooltip />
                      <Area
                        dataKey="best_score"
                        stroke="#2563eb"
                        fill="#93c5fd"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Test Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select
                  value={selectedTest}
                  onValueChange={(v) => {
                    setSelectedTest(v);
                    fetchBreakdown(v);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a test" />
                  </SelectTrigger>
                  <SelectContent>
                    {weekly.map((t) => (
                      <SelectItem key={t.test_id} value={t.test_id}>
                        {t.test_title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {!breakdown && (
                  <p className="text-center text-muted-foreground">
                    Select a test to view breakdown
                  </p>
                )}

                {breakdown && (
                  <div className="flex flex-col items-center gap-1">
                    <PieChart width={260} height={260}>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        outerRadius={90}
                        isAnimationActive={false}
                      >
                        <Cell fill="#22c55e" /> {/* Correct */}
                        <Cell fill="#ef4444" /> {/* Wrong */}
                        <Cell fill="#a1a1aa" /> {/* Unanswered */}
                      </Pie>
                    </PieChart>

                    {/* ✅ Simple, stable legend */}
                    <div className="flex gap-6 text-sm">
                      <span className="flex items-center gap-2">
                        <span className="h-3 w-3 rounded-full bg-green-500" />
                        Correct
                      </span>

                      <span className="flex items-center gap-2">
                        <span className="h-3 w-3 rounded-full bg-red-500" />
                        Wrong
                      </span>

                      <span className="flex items-center gap-2">
                        <span className="h-3 w-3 rounded-full bg-gray-400" />
                        Unanswered
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* ─────────── Summary ─────────── */}
          {breakdown && (
            <Card>
              <CardHeader>
                <CardTitle>Selected Test Summary</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-sm text-muted-foreground">Attempts</p>
                  <p className="text-xl font-bold">{breakdown.attempts}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Best Score</p>
                  <p className="text-xl font-bold">
                    {breakdown.best_score}/{breakdown.total}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Correct</p>
                  <p className="text-xl font-bold text-green-600">
                    {breakdown.correct}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Wrong</p>
                  <p className="text-xl font-bold text-red-600">
                    {breakdown.wrong}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
