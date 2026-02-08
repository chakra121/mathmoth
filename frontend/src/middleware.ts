import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // ❌ Not authenticated
  if (!token) {
    return NextResponse.redirect(
      new URL("/", req.url)
    );
  }

  // 🎓 Student dashboard protection
  if (pathname.startsWith("/dashboard")) {
    if (token.role !== "STUDENT") {
      return NextResponse.redirect(
        new URL("/admin/login", req.url)
      );
    }

    // Optional: ensure slug matches logged-in student
    if (token.slug && !pathname.startsWith(`/dashboard/${token.slug}`)) {
      return NextResponse.redirect(
        new URL(`/dashboard/${token.slug}`, req.url)
      );
    }
  }

  // 🛠️ Admin dashboard protection
  if (pathname.startsWith("/admin/dashboard")) {
    if (token.role !== "ADMIN") {
      return NextResponse.redirect(
        new URL("/admin/login", req.url)
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/dashboard/:path*"],
};