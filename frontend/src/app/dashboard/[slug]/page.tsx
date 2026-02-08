export default async function StudentDashboardHome({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params; // ✅ Next.js 15 safe

  return (
    <div>
      <h2 className="text-2xl font-semibold">
        Welcome, {slug}
      </h2>

      <p className="text-muted-foreground mt-2">
        Select a section from the navbar to continue.
      </p>
    </div>
  );
}
