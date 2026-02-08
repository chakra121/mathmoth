"use client";

import { useEffect, useState } from "react";
import { API_BASE } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

type TestLink = {
  id: string;
  title: string;
  url: string;
  active: boolean;
};

export default function AdminTestLinksPage() {
  const [links, setLinks] = useState<TestLink[]>([]);
  const [open, setOpen] = useState(false);

  // form state
  const [editing, setEditing] = useState<TestLink | null>(null);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [active, setActive] = useState(true);

  async function fetchLinks() {
    const res = await fetch(`${API_BASE}/admin/test-links`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json();
    setLinks(Array.isArray(data) ? data : []);
  }

  function isValidHttpsUrl(url: string) {
    return /^https:\/\/.+/.test(url);
  }

  useEffect(() => {
    fetchLinks();
  }, []);

  function openCreate() {
    setEditing(null);
    setTitle("");
    setUrl("");
    setActive(true);
    setOpen(true);
  }

  function openEdit(link: TestLink) {
    setEditing(link);
    setTitle(link.title);
    setUrl(link.url);
    setActive(link.active);
    setOpen(true);
  }

  async function saveLink() {
    const payload = { title, url, active };

    if (editing) {
      await fetch(`${API_BASE}/admin/test-links/${editing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch(`${API_BASE}/admin/test-links`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }

    setOpen(false);
    fetchLinks();
  }

  async function deleteLink(id: string) {
    if (!confirm("Delete this test link?")) return;

    await fetch(`${API_BASE}/admin/test-links/${id}`, {
      method: "DELETE",
    });

    fetchLinks();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Test Links</h2>
        <Button onClick={openCreate}>Add Link</Button>
      </div>

      {/* List */}
      {links.length === 0 && (
        <p className="text-muted-foreground">No test links created yet.</p>
      )}

      {links.map((link) => (
        <div
          key={link.id}
          className="border rounded p-4 flex justify-between items-center"
        >
          <div>
            <p className="font-medium">{link.title}</p>
            <p className="text-sm text-muted-foreground">{link.url}</p>
            <p className="text-sm">
              Status:{" "}
              {link.active ? (
                <span className="text-green-600">Active</span>
              ) : (
                <span className="text-red-600">Inactive</span>
              )}
            </p>
          </div>

          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => openEdit(link)}>
              Edit
            </Button>

            <Button
              size="sm"
              variant="destructive"
              onClick={() => deleteLink(link.id)}
            >
              Delete
            </Button>
          </div>
        </div>
      ))}

      {/* Create / Edit Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit Test Link" : "Add Test Link"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>

            <div>
              <Label>URL</Label>
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
              />
              {!isValidHttpsUrl(url) && url && (
                <p className="text-sm text-red-500 mt-1">
                  URL must start with <code>https://</code>
                </p>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Switch checked={active} onCheckedChange={setActive} />
              <Label>Active</Label>
            </div>

            <Button
              className="w-full"
              onClick={saveLink}
              disabled={!title || !url || !isValidHttpsUrl(url)}
            >
              {editing ? "Update Link" : "Create Link"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
