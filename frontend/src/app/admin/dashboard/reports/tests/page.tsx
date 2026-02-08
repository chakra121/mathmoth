"use client";

import { useEffect, useState } from "react";
import { API_BASE } from "@/lib/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type ReportRow = {
  test_id: string;
  test_title: string;
  max_marks: number;
  avg_marks: number;
  students_attempted: number;
  total_attempts: number;
  avg_percentage: number;
};

export default function TestReportsPage() {
  const [reports, setReports] = useState<ReportRow[]>([]);

  useEffect(() => {
    fetch(`${API_BASE}/admin/reports/tests`)
      .then((res) => res.json())
      .then(setReports);
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Test Reports</h2>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Test Name</TableHead>
              <TableHead className="text-center">
                Max Marks
              </TableHead>
              <TableHead className="text-center">
                Avg Marks
              </TableHead>
              <TableHead className="text-center">
                Students Attempted
              </TableHead>
              <TableHead className="text-center">
                Total Attempts
              </TableHead>
              <TableHead className="text-center">
                Avg Score (%)
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {reports.map((r) => (
              <TableRow key={r.test_id}>
                <TableCell className="font-medium">
                  {r.test_title}
                </TableCell>
                <TableCell className="text-center">
                  {r.max_marks}
                </TableCell>
                <TableCell className="text-center">
                  {r.avg_marks}
                </TableCell>
                <TableCell className="text-center">
                  {r.students_attempted}
                </TableCell>
                <TableCell className="text-center">
                  {r.total_attempts}
                </TableCell>
                <TableCell className="text-center">
                  {r.avg_percentage}%
                </TableCell>
              </TableRow>
            ))}

            {reports.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-muted-foreground"
                >
                  No reports available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
