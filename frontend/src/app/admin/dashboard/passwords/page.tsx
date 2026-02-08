"use client";

import { useEffect, useState } from "react";
import { API_BASE } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { toast } from "sonner";

type User = {
  id: string;
  name: string;
  role: "ADMIN" | "STUDENT";
};

export default function AdminPasswordsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  useEffect(() => {
    fetch(`${API_BASE}/admin/users`)
      .then((res) => res.json())
      .then(setUsers);
  }, []);

  async function updatePassword() {
    if (!userId) {
      toast.error("Select a user");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (password !== confirm) {
      toast.error("Passwords do not match");
      return;
    }

    const res = await fetch(
      `${API_BASE}/admin/passwords/change`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          new_password: password,
        }),
      }
    );

    if (!res.ok) {
      toast.error("Failed to update password");
      return;
    }

    toast.success("Password updated successfully");
    setPassword("");
    setConfirm("");
  }

  return (
    <div className="max-w-xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Change User Password</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <Select onValueChange={setUserId}>
            <SelectTrigger>
              <SelectValue placeholder="Select user" />
            </SelectTrigger>
            <SelectContent>
              {users.map((u) => (
                <SelectItem key={u.id} value={u.id}>
                  {u.name} ({u.role})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            type="password"
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Input
            type="password"
            placeholder="Confirm password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />

          <Button onClick={updatePassword}>
            Update Password
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
