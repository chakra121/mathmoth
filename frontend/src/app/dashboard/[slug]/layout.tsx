"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ReactNode, use } from "react";
import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";

export default function DashboardLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ slug: string }>;
}) {
  // ✅ unwrap params (Next.js 15 safe)
  const { slug } = use(params);

  // ✅ detect route
  const pathname = usePathname();

  // ❌ hide navbar for test-related pages
  const hideNavbar =
    pathname.includes("/tests/");

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar (conditionally rendered) */}
      {!hideNavbar && (
        <nav className="border-b px-6 py-4 flex items-center justify-between">
          <h1 className="font-bold text-xl">Mathmoth</h1>

          <div className="flex gap-4">
            <Link href={`/dashboard/${slug}/tests`}>
              <Button variant="ghost">Tests</Button>
            </Link>

            <Link href={`/dashboard/${slug}/submissions`}>
              <Button variant="ghost">Submissions</Button>
            </Link>

            <Button
              variant="destructive"
              onClick={() => signOut()}
            >
              Logout
            </Button>
          </div>
        </nav>
      )}

      {/* Page Content */}
      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  );
}
