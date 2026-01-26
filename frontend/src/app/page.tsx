import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md text-center space-y-8 p-6">

        {/* Brand */}
        <h1 className="text-4xl font-bold tracking-tight">
          Mathmoth
        </h1>
        <p className="text-muted-foreground">
          Practice. Test. Improve.
        </p>

        {/* Actions */}
        <div className="flex flex-col gap-4 mt-8">
          <Link href="/student/login">
            <Button size="lg" className="w-full">
              🎓 Student
            </Button>
          </Link>

          <Link href="/admin/login">
            <Button size="lg" variant="outline" className="w-full">
              🛠 Admin
            </Button>
          </Link>
        </div>

      </div>
    </main>
  );
}
