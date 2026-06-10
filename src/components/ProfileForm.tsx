"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export default function ProfileForm({
  user,
  profile,
}: {
  user: User;
  profile: { full_name?: string } | null;
}) {
  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSave() {
    setSaving(true);
    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      full_name: fullName,
      updated_at: new Date().toISOString(),
    });
    setMessage(error ? "Error saving." : "Profile saved!");
    setSaving(false);
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="block text-sm font-medium mb-1">Email</label>
        <p className="text-gray-500">{user.email}</p>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Full Name</label>
        <input
          className="border rounded px-3 py-2 w-full"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
      </div>
      <button
        onClick={handleSave}
        disabled={saving}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save"}
      </button>
      {message && <p className="text-sm text-green-600">{message}</p>}
    </div>
  );
}
