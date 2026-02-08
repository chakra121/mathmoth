"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardRedirect() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated" && session?.user?.slug) {
      router.replace(`/dashboard/${session.user.slug}`);
    }
  }, [status, session, router]);

  return <p className="p-10">Redirecting...</p>;
}
