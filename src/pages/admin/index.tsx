"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Head from "next/head";

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
  const [editingTagId, setEditingTagId] = useState<string | null>(null);

  const [efforts, setEfforts] = useState<Effort[]>([]);
  const [newEffort, setNewEffort] = useState("");
  const [editingEffortId, setEditingEffortId] = useState<string | null>(null);

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

  async function updateTag(id: string, name: string) {
    await supabase.from("tags").update({ name }).eq("id", id);
    setEditingTagId(null);
    loadTags();
  }

  async function deleteTag(id: string) {
    if (!confirm("Are you sure you want to delete this tag?")) return;
    await supabase.from("tags").delete().eq("id", id);
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

  async function updateEffort(id: string, name: string) {
    await supabase.from("efforts").update({ name }).eq("id", id);
    setEditingEffortId(null);
    loadEfforts();
  }

  async function deleteEffort(id: string) {
    if (!confirm("Are you sure you want to delete this effort?")) return;
    await supabase.from("efforts").delete().eq("id", id);
    loadEfforts();
  }

  return (
    <>
      <Head>
        <title>Admin Dashboard | Get Stuffed !</title>
      </Head>
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
                      className={`px-2 py-1 rounded ${u.is_admin ? "bg-blue-600 text-white" : "bg-gray-300"
                        }`}
                    >
                      {u.is_admin ? "Demote" : "Promote"}
                    </button>
                  </td>
                  <td className="p-2 border">
                    <button
                      onClick={() => toggleBan(u)}
                      className={`px-2 py-1 rounded ${u.banned ? "bg-red-600 text-white" : "bg-gray-300"
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
              onKeyDown={(e) => e.key === "Enter" && addTag()}
              className="border p-2 rounded flex-1"
            />
            <button
              onClick={addTag}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-1"
              title="Add tag"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </button>
          </div>
          <ul className="space-y-1">
            {tags.map((t) => (
              <li key={t.id} className="flex gap-2 items-center">
                {editingTagId === t.id ? (
                  <>
                    <input
                      type="text"
                      defaultValue={t.name}
                      onBlur={(e) => updateTag(t.id, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") updateTag(t.id, e.currentTarget.value);
                        if (e.key === "Escape") setEditingTagId(null);
                      }}
                      className="border p-1 rounded flex-1"
                      autoFocus
                    />
                    <button
                      onClick={() => setEditingTagId(null)}
                      className="px-2 py-1 bg-gray-400 text-white rounded hover:bg-gray-500"
                      title="Cancel"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 p-1">{t.name}</span>
                    <button
                      onClick={() => setEditingTagId(t.id)}
                      className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                      title="Edit"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                    </button>
                    <button
                      onClick={() => deleteTag(t.id)}
                      className="p-2 bg-red-600 text-white rounded hover:bg-red-700"
                      title="Delete"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                    </button>
                  </>
                )}
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
              onKeyDown={(e) => e.key === "Enter" && addEffort()}
              className="border p-2 rounded flex-1"
            />
            <button
              onClick={addEffort}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-1"
              title="Add effort"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </button>
          </div>
          <ul className="space-y-1">
            {efforts.map((e) => (
              <li key={e.id} className="flex gap-2 items-center">
                {editingEffortId === e.id ? (
                  <>
                    <input
                      type="text"
                      defaultValue={e.name}
                      onBlur={(ev) => updateEffort(e.id, ev.target.value)}
                      onKeyDown={(ev) => {
                        if (ev.key === "Enter") updateEffort(e.id, ev.currentTarget.value);
                        if (ev.key === "Escape") setEditingEffortId(null);
                      }}
                      className="border p-1 rounded flex-1"
                      autoFocus
                    />
                    <button
                      onClick={() => setEditingEffortId(null)}
                      className="px-2 py-1 bg-gray-400 text-white rounded hover:bg-gray-500"
                      title="Cancel"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 p-1">{e.name}</span>
                    <button
                      onClick={() => setEditingEffortId(e.id)}
                      className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                      title="Edit"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                    </button>
                    <button
                      onClick={() => deleteEffort(e.id)}
                      className="p-2 bg-red-600 text-white rounded hover:bg-red-700"
                      title="Delete"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                    </button>
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}