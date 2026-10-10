"use client";

import { useEffect, useState } from "react";
import * as styles from "../../style/style";
import { useApi } from "@/frontend/(owner)/hooks/useApi/useApi";
import {
  decideRoleRequest,
  deleteUser,
  fetchRoleRequests,
  fetchUsersData,
  type RoleRequestItem,
} from "@/frontend/(owner)/services/users/users";
import { roleColor as getRoleColor, statusInfo } from "../helpers/helpers";
import { ITEMS_PER_PAGE } from "../data/data";
import { getSupabaseBrowserClient } from "@/services/supabaseBrowser";

interface UserData {
  id: string; name: string; email: string; dept: string; role: string; status: string; active: boolean;
}

export default function UsersSection() {
  const { data: apiData, refetch: refetchUsers } = useApi(fetchUsersData, { interval: 30000 });
  const {
    data: roleRequestData,
    loading: roleRequestsLoading,
    error: roleRequestsError,
    refetch: refetchRoleRequests,
  } = useApi(fetchRoleRequests, { interval: 15000 });
  const users: UserData[] = apiData?.users ?? [];
  const roleRequests: RoleRequestItem[] = roleRequestData ?? [];
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [reviewingRequestId, setReviewingRequestId] = useState<string | null>(null);
  const [reviewError, setReviewError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<UserData | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    let client: ReturnType<typeof getSupabaseBrowserClient>;
    try {
      client = getSupabaseBrowserClient();
    } catch {
      return;
    }

    const channel = client
      .channel("owner-role-requests")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "users" },
        () => void refetchRoleRequests(),
      )
      .subscribe();

    return () => {
      void client.removeChannel(channel);
    };
  }, [refetchRoleRequests]);

  async function handleRoleDecision(
    request: RoleRequestItem,
    decision: "approve" | "reject",
  ) {
    setReviewingRequestId(request.id);
    setReviewError("");
    try {
      await decideRoleRequest(request.id, decision, {
        role: request.requestedRole,
        dept: request.department,
      });
      await Promise.all([refetchRoleRequests(), refetchUsers()]);
    } catch (reason) {
      setReviewError(reason instanceof Error ? reason.message : "Permintaan role gagal diproses.");
    } finally {
      setReviewingRequestId(null);
    }
  }

  async function handleDeleteUser() {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError("");
    try {
      await deleteUser(deleteTarget.id);
      setDeleteTarget(null);
      await Promise.all([refetchUsers(), refetchRoleRequests()]);
    } catch (reason) {
      setDeleteError(reason instanceof Error ? reason.message : "Pengguna gagal dihapus.");
    } finally {
      setDeleting(false);
    }
  }

  const filteredUsers = users.filter((u) => {
    const matchSearch = search === "" || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "All" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / ITEMS_PER_PAGE));
  const paginatedUsers = filteredUsers.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h3 className={styles.title}>User Management</h3>
          <p className={styles.subtitle}>Manage personnel security, structural permissions, and administrative oversight for the industrial ecosystem.</p>
        </div>
      </div>

      <section data-focus-id="pendaftaran" className="mb-6 rounded-2xl border border-outline/30 bg-surface-container-low p-4 sm:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h4 className="text-base font-bold text-on-surface sm:text-lg">Permintaan akses role</h4>
            <p className="mt-1 text-xs text-on-surface-variant">Persetujuan ini mengaktifkan akun dan memberikan role yang diminta.</p>
          </div>
          <span className="rounded-full bg-secondary/10 px-3 py-1 text-xs font-bold text-secondary">
            {roleRequests.length} menunggu
          </span>
        </div>

        {(reviewError || roleRequestsError) && (
          <p role="alert" className="mb-3 rounded-lg border border-red-400/30 bg-red-400/10 p-3 text-xs text-red-300">
            {reviewError || roleRequestsError}
          </p>
        )}

        {roleRequestsLoading && roleRequests.length === 0 ? (
          <p className="py-5 text-center text-sm text-on-surface-variant">Memuat permintaan...</p>
        ) : roleRequests.length === 0 ? (
          <p className="py-5 text-center text-sm text-on-surface-variant">Tidak ada permintaan role yang menunggu.</p>
        ) : (
          <div className="grid gap-3 xl:grid-cols-2">
            {roleRequests.map((request) => (
              <article key={request.id} className="min-w-0 rounded-xl border border-outline/25 bg-surface p-4">
                <div className="flex min-w-0 flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="break-words text-sm font-bold text-on-surface">{request.name}</p>
                    <p className="break-all text-xs text-on-surface-variant">{request.email}</p>
                    <p className="mt-1 break-words text-xs text-on-surface-variant">
                      {request.department || "Departemen belum diisi"}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-secondary/10 px-3 py-1 text-xs font-bold capitalize text-secondary">
                    {request.requestedRole}
                  </span>
                </div>
                <p className="mt-3 text-[11px] text-on-surface-variant">
                  Diajukan {new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(new Date(request.createdAt))}
                </p>
                <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    disabled={reviewingRequestId !== null}
                    onClick={() => void handleRoleDecision(request, "reject")}
                    className="min-h-11 rounded-xl border border-outline/35 px-4 text-xs font-bold text-on-surface-variant disabled:opacity-50"
                  >
                    {reviewingRequestId === request.id ? "Memproses..." : "Tolak"}
                  </button>
                  <button
                    type="button"
                    disabled={reviewingRequestId !== null}
                    onClick={() => void handleRoleDecision(request, "approve")}
                    className="min-h-11 rounded-xl bg-secondary px-4 text-xs font-bold text-primary disabled:opacity-50"
                  >
                    {reviewingRequestId === request.id ? "Memproses..." : "Setujui role"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

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
              {[
                "All",
                "pelanggan",
                "marketing",
                "gudang",
                "keuangan",
                "proyek",
                "field",
                "produksi",
                "manager",
                "owner",
              ].map((role) => (
                <button key={role} onClick={(e) => { e.stopPropagation(); setRoleFilter(role); setShowRoleDropdown(false); setPage(1); }} className={`${styles.dropdownItem} ${roleFilter === role ? styles.dropdownActive : styles.dropdownInactive}`}>{role}</button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className={`${styles.tableContainer} hidden sm:block`}>
        <table className={styles.table}>
          <thead>
            <tr className={styles.tableHeaderRow}>
              {["Employee", "Department", "Role", "Status"].map((h) => (
                <th key={h} className={styles.tableHeaderCell}>{h}</th>
              ))}
              <th className={`${styles.tableHeaderCell} ${styles.tableHeaderCellRight}`}>Actions</th>
            </tr>
          </thead>
          <tbody className={styles.tableBody}>
            {paginatedUsers.map((u) => (
              <tr key={u.id} className={styles.tableRow}>
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
                <td className={styles.actionsCell}>
                  <div className={styles.actionsGroup}>
                    <button
                      type="button"
                      title={`Hapus ${u.name}`}
                      aria-label={`Hapus pengguna ${u.name}`}
                      onClick={() => { setDeleteError(""); setDeleteTarget(u); }}
                      className={styles.deleteButton}
                    >
                      <span className={styles.icon}>delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="space-y-3 sm:hidden">
        {paginatedUsers.length === 0 && (
          <li className="rounded-2xl border border-outline/30 bg-surface p-5 text-center text-sm text-on-surface-variant">
            Tidak ada pengguna yang cocok dengan filter.
          </li>
        )}
        {paginatedUsers.map((u) => (
          <li key={u.id} className="rounded-2xl border border-outline/30 bg-surface p-4">
            <div className="flex min-w-0 items-start justify-between gap-3">
              <div className={`${styles.userCell} min-w-0`}>
                <div className={styles.avatar}>
                  <span className={`${styles.icon} ${styles.avatarIcon}`}>account_circle</span>
                </div>
                <div className="min-w-0">
                  <p className={styles.userName}>{u.name}</p>
                  <p className={`${styles.userEmail} break-all`}>{u.email}</p>
                </div>
              </div>
              <button
                type="button"
                title={`Hapus ${u.name}`}
                aria-label={`Hapus pengguna ${u.name}`}
                onClick={() => { setDeleteError(""); setDeleteTarget(u); }}
                className={styles.deleteButton}
              >
                <span className={styles.icon}>delete</span>
              </button>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className={`${styles.roleBadge} ${getRoleColor(u.role)}`}>{u.role}</span>
              <span className={`${styles.statusBadge} ${statusInfo(u.status).statusColor}`}>
                {u.active ? <span className={`${styles.statusDot} ${styles.statusDotActive}`} /> : u.status === "SUSPENDED" ? <span className={`${styles.statusDot} ${styles.statusDotSuspended}`} /> : <span className={`${styles.statusDot} ${styles.statusDotPending}`} />}
                {u.status}
              </span>
              <span className="text-xs text-on-surface-variant">{u.dept}</span>
            </div>
          </li>
        ))}
      </ul>

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

      {deleteTarget && (
        <div className={styles.modalOverlay} onClick={() => { if (!deleting) setDeleteTarget(null); }}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h4 className={styles.modalTitle}>Hapus pengguna?</h4>
            <p className="text-xs leading-relaxed text-on-surface-variant">
              Akun <span className="font-bold text-on-surface">{deleteTarget.name}</span>{" "}
              ({deleteTarget.email}) dengan role{" "}
              <span className="font-bold text-on-surface">{deleteTarget.role}</span> akan
              dihapus dari manajemen user beserta permintaan role-nya dan tidak dapat
              dipulihkan.
            </p>
            {deleteError && (
              <p role="alert" className="mt-4 rounded-lg border border-red-400/30 bg-red-400/10 p-3 text-xs text-red-300">
                {deleteError}
              </p>
            )}
            <div className={styles.modalActions}>
              <button type="button" disabled={deleting} onClick={() => setDeleteTarget(null)} className={styles.modalCancelButton}>
                Batal
              </button>
              <button type="button" disabled={deleting} onClick={() => void handleDeleteUser()} className={styles.modalConfirmButton}>
                {deleting ? "Menghapus..." : "Hapus pengguna"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
