"use client";

import { useState, useEffect, useRef } from "react";
import * as styles from "../../style/style";
import { useApi } from "@/frontend/Manager/(manager)/hooks/useApi/useApi";
import { fetchUsersData } from "@/frontend/Manager/(manager)/services/users/users";
import { roleColor as getRoleColor, statusInfo } from "../helpers/helpers";
import { ITEMS_PER_PAGE, defaultUserForm } from "../data/data";

interface UserData {
  name: string; email: string; dept: string; role: string; status: string; active: boolean;
}

export default function UsersSection() {
  const { data: apiData } = useApi(fetchUsersData, { interval: 30000 });
  const seeded = useRef(false);
  const [users, setUsers] = useState<UserData[]>([]);

  useEffect(() => {
    if (apiData && !seeded.current) {
      seeded.current = true;
      setUsers(apiData.users);
    }
  }, [apiData]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [form, setForm] = useState(defaultUserForm);

  const filteredUsers = users.filter((u) => {
    const matchSearch = search === "" || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "All" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / ITEMS_PER_PAGE));
  const paginatedUsers = filteredUsers.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleAdd = () => {
    if (!form.name || !form.email) return;
    const roleColor = getRoleColor(form.role);
    const { statusColor, active } = statusInfo("PENDING");
    setUsers((prev) => [...prev, { ...form, roleColor, status: "PENDING", statusColor, active }]);
    setShowAddModal(false);
    setForm(defaultUserForm);
  };

  const handleOpenEdit = (idx: number) => {
    const user = filteredUsers[idx];
    setEditingIdx(users.indexOf(user));
    setForm({ name: user.name, email: user.email, dept: user.dept, role: user.role, status: user.status });
    setShowEditModal(true);
  };

  const handleSaveEdit = () => {
    if (editingIdx === null) return;
    const roleColor = getRoleColor(form.role);
    const { statusColor, active } = statusInfo(form.status);
    setUsers((prev) => prev.map((u, i) => i === editingIdx ? { ...u, ...form, roleColor, statusColor, active } : u));
    setShowEditModal(false);
    setEditingIdx(null);
  };

  const handleDelete = (idx: number) => {
    const user = filteredUsers[idx];
    if (!confirm(`Hapus user ${user.name}?`)) return;
    setUsers((prev) => prev.filter((u) => u !== user));
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h3 className={styles.title}>User Management</h3>
          <p className={styles.subtitle}>Manage personnel security, structural permissions, and administrative oversight for the industrial ecosystem.</p>
        </div>
        <button onClick={() => { setForm(defaultUserForm); setShowAddModal(true); }} className={styles.addButton}>
          <span className={styles.icon}>person_add</span><span>Add New User</span>
        </button>
      </div>

      <div className={styles.filterGrid}>
        <div className={styles.searchCard}>
          <span className={`${styles.icon} ${styles.searchIcon}`}>filter_list</span>
          <input className={styles.searchInput} placeholder="Filter by name, email, or employee ID..." type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <div className={styles.filterCard} onClick={() => setShowRoleDropdown(!showRoleDropdown)}>
          <span className={styles.filterCardLabel}>Role: {roleFilter}</span>
          <span className={`${styles.icon} ${styles.expandIcon}`}>expand_more</span>
          {showRoleDropdown && (
            <div className={styles.dropdown}>
              {["All", "Owner", "Admin", "Staff"].map((role) => (
                <button key={role} onClick={(e) => { e.stopPropagation(); setRoleFilter(role); setShowRoleDropdown(false); setPage(1); }} className={`${styles.dropdownItem} ${roleFilter === role ? styles.dropdownActive : styles.dropdownInactive}`}>{role}</button>
              ))}
            </div>
          )}
        </div>
        <div className={styles.filterCard}>
          <span className={styles.filterCardLabel}>Dept: Manufacturing</span>
          <span className={`${styles.icon} ${styles.expandIcon}`}>expand_more</span>
        </div>
      </div>

      <div className={styles.mobileList}>
        {paginatedUsers.length === 0 && (
          <div className={`${styles.card} py-10 text-center text-xs text-on-surface-variant`}>
            Tidak ada user yang cocok.
          </div>
        )}
        {paginatedUsers.map((u, i) => (
          <div key={u.email} className={styles.card}>
            <div className={styles.cardTop}>
              <div className="flex items-center gap-3 min-w-0">
                <div className={styles.avatar}><span className={`${styles.icon} ${styles.avatarIcon}`}>account_circle</span></div>
                <div className="min-w-0">
                  <p className={`${styles.userName} truncate`}>{u.name}</p>
                  <p className={`${styles.userEmail} truncate`}>{u.email}</p>
                </div>
              </div>
              <span className={`${styles.roleBadge} shrink-0 ${getRoleColor(u.role)}`}>{u.role}</span>
            </div>
            <div className={styles.cardInfo}>
              <div className="truncate">{u.dept}</div>
              <div className={`${styles.statusBadge} ${statusInfo(u.status).statusColor}`}>
                {u.active ? <span className={`${styles.statusDot} ${styles.statusDotActive}`} /> : u.status === "SUSPENDED" ? <span className={`${styles.statusDot} ${styles.statusDotSuspended}`} /> : <span className={`${styles.statusDot} ${styles.statusDotPending}`} />}
                {u.status}
              </div>
            </div>
            <div className={`${styles.cardActions} gap-2`}>
              <button onClick={() => handleOpenEdit(i)} className={`${styles.editButton} w-full`} title="Edit"><span className={styles.icon}>edit</span></button>
              <button onClick={() => handleDelete(i)} className={`${styles.deleteButton} w-full`} title="Hapus"><span className={styles.icon}>delete</span></button>
            </div>
          </div>
        ))}
      </div>

      <div className={`${styles.tableContainer} ${styles.desktopOnly}`}>
        <table className={styles.table}>
          <thead>
            <tr className={styles.tableHeaderRow}>
              {["Employee", "Department", "Role", "Status", "Actions"].map((h) => (
                <th key={h} className={`${styles.tableHeaderCell} ${h === "Actions" ? styles.tableHeaderCellRight : ""}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className={styles.tableBody}>
            {paginatedUsers.map((u, i) => (
              <tr key={u.email} className={styles.tableRow}>
                <td className={styles.tableCell}><div className={styles.userCell}>
                  <div className={styles.avatar}><span className={`${styles.icon} ${styles.avatarIcon}`}>account_circle</span></div>
                  <div><p className={styles.userName}>{u.name}</p><p className={styles.userEmail}>{u.email}</p></div>
                </div></td>
                <td className={styles.deptCell}>{u.dept}</td>
                <td className={styles.tableCell}><span className={`${styles.roleBadge} ${getRoleColor(u.role)}`}>{u.role}</span></td>
                <td className={styles.tableCell}><span className={`${styles.statusBadge} ${statusInfo(u.status).statusColor}`}>
                  {u.active ? <span className={`${styles.statusDot} ${styles.statusDotActive}`} /> : u.status === "SUSPENDED" ? <span className={`${styles.statusDot} ${styles.statusDotSuspended}`} /> : <span className={`${styles.statusDot} ${styles.statusDotPending}`} />}
                  {u.status}
                </span></td>
                <td className={styles.actionsCell}><div className={styles.actionsGroup}>
                  <button onClick={() => handleOpenEdit(i)} className={styles.editButton} title="Edit"><span className={styles.icon}>edit</span></button>
                  <button onClick={() => handleDelete(i)} className={styles.deleteButton} title="Hapus"><span className={styles.icon}>delete</span></button>
                </div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.pagination}>
        <p className={styles.paginationText}>Showing <span className={styles.paginationHighlight}>{filteredUsers.length > 0 ? (page - 1) * ITEMS_PER_PAGE + 1 : 0} to {Math.min(page * ITEMS_PER_PAGE, filteredUsers.length)}</span> of <span className={styles.paginationHighlight}>{filteredUsers.length}</span> employees</p>
        <div className={styles.paginationButtons}>
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className={styles.paginationNav}>PREVIOUS</button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <button key={n} onClick={() => setPage(n)} className={`${styles.pageButton} ${n === page ? styles.activePage : styles.inactivePage}`}>{n}</button>
          ))}
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className={styles.paginationNav}>NEXT</button>
        </div>
      </div>

      {showAddModal && (
        <div className={styles.modalOverlay} onClick={() => setShowAddModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h4 className={styles.modalTitle}>Tambah User Baru</h4>
            <div className={styles.modalForm}>
              <input className={styles.modalInput} placeholder="Nama Lengkap" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <input className={styles.modalInput} placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <input className={styles.modalInput} placeholder="Departemen" value={form.dept} onChange={(e) => setForm({ ...form, dept: e.target.value })} />
              <select className={styles.modalSelect} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                <option value="Staff">Staff</option><option value="Admin">Admin</option>
              </select>
            </div>
            <div className={styles.modalActions}>
              <button onClick={() => setShowAddModal(false)} className={styles.modalCancelButton}>Batal</button>
              <button onClick={handleAdd} className={styles.modalConfirmButton}>Tambah</button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className={styles.modalOverlay} onClick={() => setShowEditModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h4 className={styles.modalTitle}>Edit User</h4>
            <div className={styles.modalForm}>
              <input className={styles.modalInput} placeholder="Nama Lengkap" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <input className={styles.modalInput} placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <input className={styles.modalInput} placeholder="Departemen" value={form.dept} onChange={(e) => setForm({ ...form, dept: e.target.value })} />
              <select className={styles.modalSelect} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                <option value="Owner">Owner</option><option value="Admin">Admin</option><option value="Staff">Staff</option>
              </select>
              <select className={styles.modalSelect} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="ACTIVE">ACTIVE</option><option value="PENDING">PENDING</option><option value="SUSPENDED">SUSPENDED</option>
              </select>
            </div>
            <div className={styles.modalActions}>
              <button onClick={() => setShowEditModal(false)} className={styles.modalCancelButton}>Batal</button>
              <button onClick={handleSaveEdit} className={styles.modalConfirmButton}>Simpan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
