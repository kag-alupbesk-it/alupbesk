"use client";

import { useState } from "react";
import * as styles from "../../style/style";
import { useApi } from "@/frontend/Manager/(manager)/hooks/useApi/useApi";
import { createUser, deleteUser, fetchUsersData, updateUser } from "@/frontend/Manager/(manager)/services/users/users";
import { roleColor as getRoleColor, statusInfo } from "../helpers/helpers";
import { ITEMS_PER_PAGE, defaultUserForm } from "../data/data";
import { useLanguage } from "@/frontend/shared/i18n/LanguageProvider";
import type { MessageKey } from "@/frontend/shared/i18n/translations";

interface UserData {
  id: string; name: string; email: string; dept: string; role: string; status: string; active: boolean;
}

const roleOptions: { value: string; label: MessageKey }[] = [
  { value: "pelanggan", label: "roleCustomer" },
  { value: "marketing", label: "roleMarketing" },
  { value: "gudang", label: "roleWarehouse" },
  { value: "keuangan", label: "roleFinance" },
  { value: "proyek", label: "roleProject" },
  { value: "field", label: "roleField" },
  { value: "produksi", label: "roleProduction" },
  { value: "manager", label: "roleManager" },
  { value: "owner", label: "roleOwner" },
];

export default function UsersSection() {
  const { t } = useLanguage();
  const { data: apiData, refetch } = useApi(fetchUsersData, { interval: 30000 });
  const users: UserData[] = apiData?.users ?? [];
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [form, setForm] = useState(defaultUserForm);
  const [mutationError, setMutationError] = useState("");
  const [saving, setSaving] = useState(false);
  const roleLabel = (role: string) => {
    if (role === "All") return t("managerRoleAll");
    const option = roleOptions.find((item) => item.value === role);
    return option ? t(option.label) : role;
  };
  const statusLabel = (status: string) => {
    switch (status) {
      case "ACTIVE": return t("managerUserStatusActive");
      case "PENDING": return t("managerUserStatusPending");
      case "SUSPENDED": return t("managerUserStatusSuspended");
      default: return status;
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchSearch = search === "" || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "All" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / ITEMS_PER_PAGE));
  const paginatedUsers = filteredUsers.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleAdd = async () => {
    if (!form.name || !form.email) return;
    setSaving(true);
    setMutationError("");
    try {
      await createUser(form);
      await refetch();
      setShowAddModal(false);
      setForm(defaultUserForm);
    } catch (error) {
      setMutationError(error instanceof Error ? error.message : t("managerUserSaveFailed"));
    } finally {
      setSaving(false);
    }
  };

  const handleOpenEdit = (user: UserData) => {
    setEditingIdx(users.findIndex((item) => item.id === user.id));
    setForm({ name: user.name, email: user.email, dept: user.dept, role: user.role, status: user.status });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (editingIdx === null) return;
    const current = users[editingIdx];
    if (!current) return;
    setSaving(true);
    setMutationError("");
    try {
      await updateUser(current.id, form);
      await refetch();
      setShowEditModal(false);
      setEditingIdx(null);
    } catch (error) {
      setMutationError(error instanceof Error ? error.message : t("managerUserUpdateFailed"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (user: UserData) => {
    if (!confirm(t("managerDeleteUserConfirm").replace("{name}", user.name))) return;
    setMutationError("");
    try {
      await deleteUser(user.id);
      await refetch();
    } catch (error) {
      setMutationError(error instanceof Error ? error.message : t("managerUserDeleteFailed"));
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h3 className={styles.title}>{t("userManagement")}</h3>
          <p className={styles.subtitle}>{t("managerUsersDescription")}</p>
        </div>
        <button onClick={() => { setForm(defaultUserForm); setShowAddModal(true); }} className={styles.addButton}>
          <span className={styles.icon}>person_add</span><span>{t("managerAddUser")}</span>
        </button>
      </div>
      {mutationError && <p role="alert" className="mb-4 rounded-lg border border-red-400/30 bg-red-400/10 p-3 text-xs text-red-300">{mutationError}</p>}
      {mutationError && <p role="alert" className="mb-4 rounded-lg border border-red-400/30 bg-red-400/10 p-3 text-xs text-red-300">{mutationError}</p>}

      <div className={styles.filterGrid}>
        <div className={styles.searchCard}>
          <span className={`${styles.icon} ${styles.searchIcon}`}>filter_list</span>
          <input className={styles.searchInput} placeholder={t("managerFilterUsers")} type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <div className={styles.filterCard} onClick={() => setShowRoleDropdown(!showRoleDropdown)}>
          <span className={styles.filterCardLabel}>{t("managerRoleFilter").replace("{role}", roleLabel(roleFilter))}</span>
          <span className={`${styles.icon} ${styles.expandIcon}`}>expand_more</span>
          {showRoleDropdown && (
            <div className={styles.dropdown}>
              {["All", ...roleOptions.map((option) => option.value)].map((role) => (
                <button key={role} onClick={(e) => { e.stopPropagation(); setRoleFilter(role); setShowRoleDropdown(false); setPage(1); }} className={`${styles.dropdownItem} ${roleFilter === role ? styles.dropdownActive : styles.dropdownInactive}`}>{roleLabel(role)}</button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className={styles.mobileList}>
        {paginatedUsers.length === 0 && (
          <div className={`${styles.card} py-10 text-center text-xs text-on-surface-variant`}>
            {t("managerNoUsersFound")}
          </div>
        )}
        {paginatedUsers.map((u) => (
          <div key={u.email} className={styles.card}>
            <div className={styles.cardTop}>
              <div className="flex items-center gap-3 min-w-0">
                <div className={styles.avatar}><span className={`${styles.icon} ${styles.avatarIcon}`}>account_circle</span></div>
                <div className="min-w-0">
                  <p className={`${styles.userName} truncate`}>{u.name}</p>
                  <p className={`${styles.userEmail} truncate`}>{u.email}</p>
                </div>
              </div>
              <span className={`${styles.roleBadge} shrink-0 ${getRoleColor(u.role)}`}>{roleLabel(u.role)}</span>
            </div>
            <div className={styles.cardInfo}>
              <div className="truncate">{u.dept}</div>
              <div className={`${styles.statusBadge} ${statusInfo(u.status).statusColor}`}>
                {u.active ? <span className={`${styles.statusDot} ${styles.statusDotActive}`} /> : u.status === "SUSPENDED" ? <span className={`${styles.statusDot} ${styles.statusDotSuspended}`} /> : <span className={`${styles.statusDot} ${styles.statusDotPending}`} />}
                {statusLabel(u.status)}
              </div>
            </div>
            <div className={`${styles.cardActions} gap-2`}>
              <button onClick={() => handleOpenEdit(u)} className={`${styles.editButton} w-full`} aria-label={t("edit")} title={t("edit")}><span className={styles.icon}>edit</span></button>
              <button onClick={() => void handleDelete(u)} className={`${styles.deleteButton} w-full`} aria-label={t("delete")} title={t("delete")}><span className={styles.icon}>delete</span></button>
            </div>
          </div>
        ))}
      </div>

      <div className={`${styles.tableContainer} ${styles.desktopOnly}`}>
        <table className={styles.table}>
          <thead>
            <tr className={styles.tableHeaderRow}>
              {[
                ["managerEmployee", t("managerEmployee")],
                ["managerDepartment", t("managerDepartment")],
                ["managerRole", t("managerRole")],
                ["managerStatus", t("managerStatus")],
                ["managerActions", t("managerActions")],
              ].map(([key, label]) => (
                <th key={key} className={`${styles.tableHeaderCell} ${key === "managerActions" ? styles.tableHeaderCellRight : ""}`}>{label}</th>
              ))}
            </tr>
          </thead>
          <tbody className={styles.tableBody}>
            {paginatedUsers.map((u) => (
              <tr key={u.email} className={styles.tableRow}>
                <td className={styles.tableCell}><div className={styles.userCell}>
                  <div className={styles.avatar}><span className={`${styles.icon} ${styles.avatarIcon}`}>account_circle</span></div>
                  <div><p className={styles.userName}>{u.name}</p><p className={styles.userEmail}>{u.email}</p></div>
                </div></td>
                <td className={styles.deptCell}>{u.dept}</td>
                <td className={styles.tableCell}><span className={`${styles.roleBadge} ${getRoleColor(u.role)}`}>{roleLabel(u.role)}</span></td>
                <td className={styles.tableCell}><span className={`${styles.statusBadge} ${statusInfo(u.status).statusColor}`}>
                  {u.active ? <span className={`${styles.statusDot} ${styles.statusDotActive}`} /> : u.status === "SUSPENDED" ? <span className={`${styles.statusDot} ${styles.statusDotSuspended}`} /> : <span className={`${styles.statusDot} ${styles.statusDotPending}`} />}
                  {statusLabel(u.status)}
                </span></td>
                <td className={styles.actionsCell}><div className={styles.actionsGroup}>
                  <button onClick={() => handleOpenEdit(u)} className={styles.editButton} aria-label={t("edit")} title={t("edit")}><span className={styles.icon}>edit</span></button>
                  <button onClick={() => void handleDelete(u)} className={styles.deleteButton} aria-label={t("delete")} title={t("delete")}><span className={styles.icon}>delete</span></button>
                </div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.pagination}>
        <p className={styles.paginationText}>{t("managerPaginationSummary").replace("{start}", String(filteredUsers.length > 0 ? (page - 1) * ITEMS_PER_PAGE + 1 : 0)).replace("{end}", String(Math.min(page * ITEMS_PER_PAGE, filteredUsers.length))).replace("{count}", String(filteredUsers.length))}</p>
        <div className={styles.paginationButtons}>
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className={styles.paginationNav}>{t("managerPrevious")}</button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <button key={n} onClick={() => setPage(n)} className={`${styles.pageButton} ${n === page ? styles.activePage : styles.inactivePage}`}>{n}</button>
          ))}
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className={styles.paginationNav}>{t("managerNext")}</button>
        </div>
      </div>

      {showAddModal && (
        <div className={styles.modalOverlay} onClick={() => setShowAddModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h4 className={styles.modalTitle}>{t("managerAddUserTitle")}</h4>
            <div className={styles.modalForm}>
              <input className={styles.modalInput} placeholder={t("managerFullName")} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <input className={styles.modalInput} placeholder={t("managerEmail")} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <input className={styles.modalInput} placeholder={t("managerDepartmentField")} value={form.dept} onChange={(e) => setForm({ ...form, dept: e.target.value })} />
              <select className={styles.modalSelect} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                {roleOptions.map((option) => <option key={option.value} value={option.value}>{t(option.label)}</option>)}
              </select>
            </div>
            <div className={styles.modalActions}>
              <button onClick={() => setShowAddModal(false)} className={styles.modalCancelButton}>{t("managerCancel")}</button>
              <button onClick={() => void handleAdd()} disabled={saving} className={styles.modalConfirmButton}>{saving ? t("commonSavingChanges") : t("managerAdd")}</button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className={styles.modalOverlay} onClick={() => setShowEditModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h4 className={styles.modalTitle}>{t("managerEditUserTitle")}</h4>
            <div className={styles.modalForm}>
              <input className={styles.modalInput} placeholder={t("managerFullName")} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <input className={styles.modalInput} placeholder={t("managerEmail")} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <input className={styles.modalInput} placeholder={t("managerDepartmentField")} value={form.dept} onChange={(e) => setForm({ ...form, dept: e.target.value })} />
              <select className={styles.modalSelect} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                {roleOptions.map((option) => <option key={option.value} value={option.value}>{t(option.label)}</option>)}
              </select>
              <select className={styles.modalSelect} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="ACTIVE">{t("managerUserStatusActive")}</option>
                <option value="PENDING">{t("managerUserStatusPending")}</option>
                <option value="SUSPENDED">{t("managerUserStatusSuspended")}</option>
              </select>
            </div>
            <div className={styles.modalActions}>
              <button onClick={() => setShowEditModal(false)} className={styles.modalCancelButton}>{t("managerCancel")}</button>
              <button onClick={() => void handleSaveEdit()} disabled={saving} className={styles.modalConfirmButton}>{saving ? t("commonSavingChanges") : t("managerSave")}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
