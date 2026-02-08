"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ReactNode } from "react";
import { signOut } from "next-auth/react";

export default function AdminDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <nav className="border-b px-6 py-4 flex justify-between items-center">
        <h1 className="font-bold text-xl">Mathmoth Admin</h1>

        <div className="flex gap-4">
          <Link href="/admin/dashboard/tests">
            <Button variant="ghost">Tests</Button>
          </Link>

          <Link href="/admin/dashboard/test-links">
            <Button variant="ghost">Test Links</Button>
          </Link>

          <Link href="/admin/dashboard/reports/tests">
            <Button variant="ghost">Tests Reports</Button>
          </Link>

          <Link href="/admin/dashboard/reports/students">
            <Button variant="ghost">Students Reports</Button>
          </Link>

          <Link href="/admin/dashboard/passwords">
            <Button variant="ghost">Passwords</Button>
          </Link>

          <Button variant="destructive" onClick={() => signOut()}>
            Logout
          </Button>
        </div>
      </nav>

      <main className="p-6 flex-1">{children}</main>
    </div>
  );
}
