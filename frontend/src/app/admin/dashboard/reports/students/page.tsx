"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { API_BASE } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Student {
  id: string;
  name: string;
  email: string;
  total_attempts: number;
}

export default function StudentReportsPage() {
  const [students, setStudents] = useState<Student[]>([]);

  useEffect(() => {
    fetch(`${API_BASE}/admin/reports/students`)
      .then(res => res.json())
      .then(setStudents);
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Student Reports</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {students.map(s => (
          <Card key={s.id}>
            <CardContent className=" space-y-2">
              <p className="font-medium">{s.name}</p>
              <p className="text-sm text-muted-foreground">
                {s.email}
              </p>
              <p className="text-sm">
                Attempts: {s.total_attempts}
              </p>

              <Link
                href={`/admin/dashboard/reports/students/${s.id}`}
              >
                <Button className="w-full" variant="secondary">
                  View Report
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
