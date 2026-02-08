import { API_BASE } from "@/lib/api";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export default async function TestDetailPage({
  params,
}: {
  params: Promise<{ testId: string }>;
}) {
  const { testId } = await params;

  const res = await fetch(`${API_BASE}/admin/tests/${testId}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    redirect("/admin/dashboard/tests");
  }

  const test = await res.json();

  /* ---------------- Toggle Publish / Draft ---------------- */
  async function toggleStatus() {
    "use server";

    const endpoint =
      test.status === "draft"
        ? `${API_BASE}/admin/tests/${testId}/publish`
        : `${API_BASE}/admin/tests/${testId}/draft`;

    await fetch(endpoint, { method: "PATCH" });
    revalidatePath(`/admin/dashboard/tests/${testId}`);
  }

  /* ---------------- Delete Test (Cascade) ---------------- */
  async function deleteTest() {
    "use server";

    await fetch(`${API_BASE}/admin/tests/delete/${testId}`, {
      method: "DELETE",
    });

    revalidatePath("/admin/dashboard/tests");
    redirect("/admin/dashboard/tests");
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <h2 className="text-2xl font-semibold">{test.title}</h2>

        {/* ✅ Status Badge */}
        <Badge
          className={
            test.status === "published"
              ? "bg-green-600 text-white"
              : "bg-red-600 text-white"
          }
        >
          {test.status.toUpperCase()}
        </Badge>
      </div>

      <p className="text-muted-foreground">
        Duration: {test.duration / 60} minutes
      </p>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <Link href={`/admin/dashboard/tests/${testId}/questions`}>
          <Button variant="outline">Manage Questions</Button>
        </Link>

        <form action={toggleStatus}>
          <Button>
            {test.status === "published" ? "Move to Draft" : "Publish"}
          </Button>
        </form>

        {/* 🔥 Delete Test */}
        <form action={deleteTest}>
          <Button variant="destructive">
            Delete Test
          </Button>
        </form>
      </div>

      {/* Warning */}
      <p className="text-sm text-muted-foreground">
        ⚠️ Deleting this test will permanently remove all questions,
        submissions, and results related to it.
      </p>
    </div>
  );
}
