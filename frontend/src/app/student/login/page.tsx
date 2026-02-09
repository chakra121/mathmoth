"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { API_BASE } from "@/lib/api";

export default function StudentLoginPage() {
  const router = useRouter();

  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* ---------------- Register ---------------- */
  async function handleRegister() {
    if (!name || !email || !password) {
      setError("All fields are required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Registration failed");
      }

      // auto login after register
      await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  /* ---------------- Login ---------------- */
  async function handleLogin() {
    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError("Invalid email or password");
      return;
    }

    // get slug from session
    const sessionRes = await fetch("/api/auth/session");
    const session = await sessionRes.json();

    if (session?.user?.slug) {
      router.push(`/dashboard/${session.user.slug}`);
    } else {
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-center text-2xl">
            {mode === "login" ? "Student Login" : "Create Student Account"}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <p className="text-sm text-red-500 text-center">{error}</p>
          )}

          {/* Name (register only) */}
          {mode === "register" && (
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Password</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <Button
            className="w-full"
            disabled={loading}
            onClick={mode === "login" ? handleLogin : handleRegister}
          >
            {loading
              ? "Please wait…"
              : mode === "login"
              ? "Login"
              : "Create Account"}
          </Button>

          <Separator />

          {/* Google Login */}
          <Button
            variant="outline"
            className="w-full"
            onClick={() =>
              signIn("google", {
                callbackUrl: "/dashboard",
              })
            }
          >
            Continue with Google
          </Button>

          <p className="text-sm text-center text-muted-foreground">
            {mode === "login" ? "New student?" : "Already have an account?"}{" "}
            <button
              className="underline cursor-pointer font-medium"
              onClick={() =>
                setMode(mode === "login" ? "register" : "login")
              }
            >
              {mode === "login" ? "Create account" : "Login"}
            </button>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
