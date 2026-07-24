"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function GroupSetupForms() {
  const router = useRouter();
  const [mode, setMode] = useState<"create" | "join">("create");
  const [groupName, setGroupName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await fetch("/api/group", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: groupName }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Something went wrong.");
      setLoading(false);
      return;
    }
    router.push("/feed");
    router.refresh();
  }

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await fetch("/api/group/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inviteCode }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Something went wrong.");
      setLoading(false);
      return;
    }
    router.push("/feed");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex rounded-full border border-border bg-card p-1 text-sm">
        <button
          onClick={() => setMode("create")}
          className={`flex-1 rounded-full py-1.5 ${
            mode === "create" ? "bg-accent text-white" : ""
          }`}
        >
          Create a group
        </button>
        <button
          onClick={() => setMode("join")}
          className={`flex-1 rounded-full py-1.5 ${
            mode === "join" ? "bg-accent text-white" : ""
          }`}
        >
          Join with a code
        </button>
      </div>

      {mode === "create" ? (
        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm">
            Group name
            <input
              className="rounded-lg border border-border bg-card px-3 py-2 outline-none focus:border-accent"
              placeholder="The Job Hunt Crew"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              required
            />
          </label>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="rounded-full bg-accent px-4 py-2.5 font-medium text-white disabled:opacity-60"
          >
            {loading ? "Creating…" : "Create group"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleJoin} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm">
            Invite code
            <input
              className="rounded-lg border border-border bg-card px-3 py-2 uppercase tracking-widest outline-none focus:border-accent"
              placeholder="ABC123"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              required
            />
          </label>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="rounded-full bg-accent px-4 py-2.5 font-medium text-white disabled:opacity-60"
          >
            {loading ? "Joining…" : "Join group"}
          </button>
        </form>
      )}
    </div>
  );
}
