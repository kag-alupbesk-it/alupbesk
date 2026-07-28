"use client";

import { useState } from "react";

type UserData = {
  name: string;
  email: string;
  dept: string;
  role: string;
  roleColor: string;
  status: string;
  statusColor: string;
  active: boolean;
};

const initialUsers: UserData[] = [
  {
    name: "Elena Rodriguez",
    email: "e.rodriguez@alupbesk.com",
    dept: "Structural Engineering",
    role: "Owner",
    roleColor: "bg-secondary/10 text-secondary",
    status: "ACTIVE",
    statusColor: "text-secondary",
    active: true,
  },
  {
    name: "Marcus Thorne",
    email: "m.thorne@alupbesk.com",
    dept: "Logistics & Supply",
    role: "Admin",
    roleColor: "bg-surface-variant text-on-surface-variant",
    status: "PENDING",
    statusColor: "text-on-surface-variant",
    active: false,
  },
  {
    name: "Sarah Jenkins",
    email: "s.jenkins@alupbesk.com",
    dept: "Precision Machining",
    role: "Staff",
    roleColor: "bg-surface-variant text-on-surface-variant",
    status: "ACTIVE",
    statusColor: "text-secondary",
    active: true,
  },
  {
    name: "Julian Weber",
    email: "j.weber@alupbesk.com",
    dept: "Quality Control",
    role: "Staff",
    roleColor: "bg-surface-variant text-on-surface-variant",
    status: "SUSPENDED",
    statusColor: "text-error",
    active: false,
  },
];

const ITEMS_PER_PAGE = 4;

function getRoleColor(role: string) {
  return role === "Owner" ? "bg-secondary/10 text-secondary" : "bg-surface-variant text-on-surface-variant";
}

function getStatusInfo(status: string) {
  switch (status) {
    case "ACTIVE": return { statusColor: "text-secondary", active: true };
    case "SUSPENDED": return { statusColor: "text-error", active: false };
    default: return { statusColor: "text-on-surface-variant", active: false };
  }
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserData[]>(initialUsers);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState<number | null>(null);
  const [newUser, setNewUser] = useState({ name: "", email: "", dept: "", role: "Staff" });
  const [editForm, setEditForm] = useState({ name: "", email: "", dept: "", role: "Staff", status: "ACTIVE" });

  const filteredUsers = users.filter((u) => {
    const matchSearch =
      search === "" ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "All" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / ITEMS_PER_PAGE));
  const paginatedUsers = filteredUsers.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  const handleAddUser = () => {
    if (!newUser.name || !newUser.email) return;
    const roleColor = getRoleColor(newUser.role);
    const { statusColor, active } = getStatusInfo("PENDING");
    setUsers((prev) => [
      ...prev,
      { ...newUser, roleColor, status: "PENDING", statusColor, active },
    ]);
    setShowAddModal(false);
    setNewUser({ name: "", email: "", dept: "", role: "Staff" });
  };

  const handleOpenEdit = (idx: number) => {
    const user = filteredUsers[idx];
    setEditingUser(users.indexOf(user));
    setEditForm({ name: user.name, email: user.email, dept: user.dept, role: user.role, status: user.status });
    setShowEditModal(true);
  };

  const handleSaveEdit = () => {
    if (editingUser === null) return;
    const roleColor = getRoleColor(editForm.role);
    const { statusColor, active } = getStatusInfo(editForm.status);
    setUsers((prev) =>
      prev.map((u, i) =>
        i === editingUser ? { ...u, ...editForm, roleColor, statusColor, active } : u
      )
    );
    setShowEditModal(false);
    setEditingUser(null);
  };

  const handleDeleteUser = (idx: number) => {
    const user = filteredUsers[idx];
    if (!confirm(`Hapus user ${user.name}?`)) return;
    setUsers((prev) => prev.filter((u) => u !== user));
  };

  return (
    <div className="p-10 flex-1">
      {/* Page Header */}
      <div className="flex justify-between items-start mb-10">
        <div>
          <h3 className="text-3xl font-bold text-white mb-2 font-headline tracking-tight">
            User Management
          </h3>
          <p className="text-on-surface-variant max-w-2xl leading-relaxed">
            Manage personnel security, structural permissions, and administrative
            oversight for the industrial ecosystem.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-secondary text-on-secondary font-bold rounded-pill shadow-lg shadow-secondary/10 hover:shadow-secondary/25 transition-all hover:-translate-y-0.5 active:translate-y-0"
        >
          <span className="material-symbols-outlined">person_add</span>
          <span>Add New User</span>
        </button>
      </div>

      {/* Filter Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
        <div className="md:col-span-2 bg-surface border border-outline p-4 rounded-xl flex items-center gap-4">
          <span className="material-symbols-outlined text-secondary">
            filter_list
          </span>
          <input
            className="bg-transparent border-none w-full focus:ring-0 text-sm text-on-surface"
            placeholder="Filter by name, email, or employee ID..."
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <div
          className="bg-surface border border-outline p-4 rounded-xl flex items-center justify-between cursor-pointer hover:border-secondary/50 transition-colors relative"
          onClick={() => setShowRoleDropdown(!showRoleDropdown)}
        >
          <span className="text-on-surface-variant text-sm font-semibold">
            Role: {roleFilter}
          </span>
          <span className="material-symbols-outlined text-on-surface-variant">
            expand_more
          </span>
          {showRoleDropdown && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-surface border border-outline rounded-xl shadow-xl z-10 overflow-hidden">
              {["All", "Owner", "Admin", "Staff"].map((role) => (
                <button
                  key={role}
                  onClick={(e) => {
                    e.stopPropagation();
                    setRoleFilter(role);
                    setShowRoleDropdown(false);
                    setPage(1);
                  }}
                  className={`w-full text-left px-4 py-3 text-sm hover:bg-surface-variant transition-colors ${
                    roleFilter === role ? "text-secondary font-bold" : "text-on-surface-variant"
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="bg-surface border border-outline p-4 rounded-xl flex items-center justify-between cursor-pointer hover:border-secondary/50 transition-colors">
          <span className="text-on-surface-variant text-sm font-semibold">
            Dept: Manufacturing
          </span>
          <span className="material-symbols-outlined text-on-surface-variant">
            expand_more
          </span>
        </div>
      </div>

      {/* User Directory Table */}
      <div className="bg-surface border border-outline rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-outline bg-surface-variant/30">
              {["Employee", "Department", "Role", "Status", "Actions"].map(
                (h) => (
                  <th
                    key={h}
                    className={`px-8 py-5 font-bold text-xs text-on-surface-variant uppercase tracking-widest font-headline ${
                      h === "Actions" ? "text-right" : ""
                    }`}
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-outline/30">
            {paginatedUsers.map((u, i) => (
              <tr
                key={u.email}
                className="hover:bg-surface-variant/20 transition-colors"
              >
                <td className="px-8 py-5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-background border border-outline flex items-center justify-center text-secondary">
                      <span className="material-symbols-outlined">
                        account_circle
                      </span>
                    </div>
                    <div>
                      <p className="font-bold text-white text-sm">{u.name}</p>
                      <p className="text-xs text-on-surface-variant mt-0.5">
                        {u.email}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5 text-sm text-on-surface-variant">
                  {u.dept}
                </td>
                <td className="px-8 py-5">
                  <span
                    className={`px-3 py-1 rounded-pill text-[11px] font-bold uppercase tracking-wider ${u.roleColor}`}
                  >
                    {u.role}
                  </span>
                </td>
                <td className="px-8 py-5">
                  <span
                    className={`flex items-center text-xs font-bold ${u.statusColor}`}
                  >
                    {u.active ? (
                      <span className="w-2 h-2 rounded-full bg-secondary mr-2 animate-pulse shadow-[0_0_8px_rgba(219,165,1,0.6)]" />
                    ) : u.status === "SUSPENDED" ? (
                      <span className="w-2 h-2 rounded-full bg-error mr-2" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-outline mr-2" />
                    )}
                    {u.status}
                  </span>
                </td>
                <td className="px-8 py-5 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => handleOpenEdit(i)}
                      className="p-2 text-on-surface-variant hover:text-secondary transition-colors"
                      title="Edit"
                    >
                      <span className="material-symbols-outlined">edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteUser(i)}
                      className="p-2 text-on-surface-variant hover:text-error transition-colors"
                      title="Hapus"
                    >
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-10 text-on-surface-variant text-sm">
        <p className="font-medium">
          Showing <span className="text-white">{filteredUsers.length > 0 ? (page - 1) * ITEMS_PER_PAGE + 1 : 0} to {Math.min(page * ITEMS_PER_PAGE, filteredUsers.length)}</span> of{" "}
          <span className="text-white">{filteredUsers.length}</span> employees
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-5 py-2 rounded-pill border border-outline text-xs font-bold hover:bg-surface-variant hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            PREVIOUS
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              onClick={() => setPage(n)}
              className={`w-10 h-10 rounded-full text-xs font-bold flex items-center justify-center transition-all ${
                n === page
                  ? "bg-secondary text-on-secondary shadow-lg shadow-secondary/20"
                  : "border border-outline hover:border-secondary"
              }`}
            >
              {n}
            </button>
          ))}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-5 py-2 rounded-pill border border-outline text-xs font-bold hover:bg-surface-variant hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            NEXT
          </button>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="bg-surface border border-outline rounded-2xl p-8 w-full max-w-md shadow-2xl animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            <h4 className="text-xl font-bold text-on-surface mb-6 font-headline">
              Tambah User Baru
            </h4>
            <div className="space-y-4">
              <input
                className="w-full bg-background border border-outline rounded-lg px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-secondary/50"
                placeholder="Nama Lengkap"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              />
              <input
                className="w-full bg-background border border-outline rounded-lg px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-secondary/50"
                placeholder="Email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              />
              <input
                className="w-full bg-background border border-outline rounded-lg px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-secondary/50"
                placeholder="Departemen"
                value={newUser.dept}
                onChange={(e) => setNewUser({ ...newUser, dept: e.target.value })}
              />
              <select
                className="w-full bg-background border border-outline rounded-lg px-4 py-3 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/50"
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
              >
                <option value="Staff">Staff</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-3 border border-outline rounded-pill text-on-surface-variant font-bold text-sm hover:bg-surface-variant transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleAddUser}
                className="flex-1 py-3 bg-secondary text-on-secondary rounded-pill font-bold text-sm hover:brightness-110 transition-all"
              >
                Tambah
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn"
          onClick={() => setShowEditModal(false)}
        >
          <div
            className="bg-surface border border-outline rounded-2xl p-8 w-full max-w-md shadow-2xl animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            <h4 className="text-xl font-bold text-on-surface mb-6 font-headline">
              Edit User
            </h4>
            <div className="space-y-4">
              <input
                className="w-full bg-background border border-outline rounded-lg px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-secondary/50"
                placeholder="Nama Lengkap"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              />
              <input
                className="w-full bg-background border border-outline rounded-lg px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-secondary/50"
                placeholder="Email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              />
              <input
                className="w-full bg-background border border-outline rounded-lg px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-secondary/50"
                placeholder="Departemen"
                value={editForm.dept}
                onChange={(e) => setEditForm({ ...editForm, dept: e.target.value })}
              />
              <select
                className="w-full bg-background border border-outline rounded-lg px-4 py-3 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/50"
                value={editForm.role}
                onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
              >
                <option value="Owner">Owner</option>
                <option value="Admin">Admin</option>
                <option value="Staff">Staff</option>
              </select>
              <select
                className="w-full bg-background border border-outline rounded-lg px-4 py-3 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/50"
                value={editForm.status}
                onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="PENDING">PENDING</option>
                <option value="SUSPENDED">SUSPENDED</option>
              </select>
            </div>
            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 py-3 border border-outline rounded-pill text-on-surface-variant font-bold text-sm hover:bg-surface-variant transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleSaveEdit}
                className="flex-1 py-3 bg-secondary text-on-secondary rounded-pill font-bold text-sm hover:brightness-110 transition-all"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
