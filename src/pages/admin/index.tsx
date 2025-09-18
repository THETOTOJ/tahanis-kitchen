"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface User {
  id: string;
  email: string;
  username: string;
  is_admin: boolean;
  banned: boolean;
  created_at: string;
}

interface Tag {
  id: string;
  name: string;
}

interface Effort {
  id: string;
  name: string;
}

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [page, setPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [search, setSearch] = useState("");

  const [tags, setTags] = useState<Tag[]>([]);
  const [newTag, setNewTag] = useState("");

  const [efforts, setEfforts] = useState<Effort[]>([]);
  const [newEffort, setNewEffort] = useState("");

  useEffect(() => {
    loadUsers();
    loadTags();
    loadEfforts();
  }, [page, search]);

  async function loadUsers() {
    let query = supabase
      .from("users")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range((page - 1) * 10, page * 10 - 1);

    if (search) {
      query = query.or(`username.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const { data, count } = await query;
    setUsers(data || []);
    setTotalUsers(count || 0);
  }

  async function toggleBan(u: User) {
    await supabase.from("users").update({ banned: !u.banned }).eq("id", u.id);
    loadUsers();
  }

  async function toggleAdmin(u: User) {
    await supabase
      .from("users")
      .update({ is_admin: !u.is_admin })
      .eq("id", u.id);
    loadUsers();
  }

  async function loadTags() {
    const { data } = await supabase.from("tags").select("*").order("name");
    setTags(data || []);
  }

  async function addTag() {
    if (!newTag.trim()) return;
    await supabase.from("tags").insert({ name: newTag });
    setNewTag("");
    loadTags();
  }

  async function editTag(id: string, name: string) {
    await supabase.from("tags").update({ name }).eq("id", id);
    loadTags();
  }

  async function loadEfforts() {
    const { data } = await supabase.from("efforts").select("*").order("name");
    setEfforts(data || []);
  }

  async function addEffort() {
    if (!newEffort.trim()) return;
    await supabase.from("efforts").insert({ name: newEffort });
    setNewEffort("");
    loadEfforts();
  }

  async function editEffort(id: string, name: string) {
    await supabase.from("efforts").update({ name }).eq("id", id);
    loadEfforts();
  }

  return (
    <div className="max-w-5xl mx-auto mt-10 space-y-10">
      <div>
        <h1 className="text-2xl font-bold mb-4">Users</h1>
        <input
          type="text"
          placeholder="Search by username or email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 mb-2 rounded w-full"
        />
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 border">Username</th>
              <th className="p-2 border">Email</th>
              <th className="p-2 border">Created At</th>
              <th className="p-2 border">Admin</th>
              <th className="p-2 border">Banned</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="text-center">
                <td className="p-2 border">{u.username}</td>
                <td className="p-2 border">{u.email}</td>
                <td className="p-2 border">
                  {new Date(u.created_at).toLocaleDateString()}
                </td>
                <td className="p-2 border">
                  <button
                    onClick={() => toggleAdmin(u)}
                    className={`px-2 py-1 rounded ${
                      u.is_admin ? "bg-blue-600 text-white" : "bg-gray-300"
                    }`}
                  >
                    {u.is_admin ? "Demote" : "Promote"}
                  </button>
                </td>
                <td className="p-2 border">
                  <button
                    onClick={() => toggleBan(u)}
                    className={`px-2 py-1 rounded ${
                      u.banned ? "bg-red-600 text-white" : "bg-gray-300"
                    }`}
                  >
                    {u.banned ? "Unban" : "Ban"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex justify-between mt-2">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="px-3 py-1 bg-gray-300 rounded"
          >
            Previous
          </button>
          <span>Page {page}</span>
          <button
            disabled={page * 10 >= totalUsers}
            onClick={() => setPage(page + 1)}
            className="px-3 py-1 bg-gray-300 rounded"
          >
            Next
          </button>
        </div>
      </div>

      <div>
        <h1 className="text-2xl font-bold mb-4">Tags</h1>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            placeholder="New tag"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            className="border p-2 rounded flex-1"
          />
          <button
            onClick={addTag}
            className="px-3 py-1 bg-green-600 text-white rounded"
          >
            Add
          </button>
        </div>
        <ul className="space-y-1">
          {tags.map((t) => (
            <li key={t.id} className="flex gap-2 items-center">
              <input
                type="text"
                value={t.name}
                onChange={(e) => editTag(t.id, e.target.value)}
                className="border p-1 rounded flex-1"
              />
              <button
                onClick={async () => {
                  await supabase.from("tags").delete().eq("id", t.id);
                  loadTags();
                }}
                className="px-2 py-1 bg-red-600 text-white rounded"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h1 className="text-2xl font-bold mb-4">Efforts</h1>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            placeholder="New effort"
            value={newEffort}
            onChange={(e) => setNewEffort(e.target.value)}
            className="border p-2 rounded flex-1"
          />
          <button
            onClick={addEffort}
            className="px-3 py-1 bg-green-600 text-white rounded"
          >
            Add
          </button>
        </div>
        <ul className="space-y-1">
          {efforts.map((e) => (
            <li key={e.id} className="flex gap-2 items-center">
              <input
                type="text"
                value={e.name}
                onChange={(ev) => editEffort(e.id, ev.target.value)}
                className="border p-1 rounded flex-1"
              />
              <button
                onClick={async () => {
                  await supabase.from("efforts").delete().eq("id", e.id);
                  loadEfforts();
                }}
                className="px-2 py-1 bg-red-600 text-white rounded"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
