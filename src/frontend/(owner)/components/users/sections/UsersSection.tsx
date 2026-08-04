"use client";

import { useState, useEffect, useRef } from "react";
import * as styles from "../style";
import { useApi } from "@/frontend/(owner)/hooks/useApi";
import { fetchUsersData } from "@/frontend/(owner)/services/users";
import { roleColor as getRoleColor, statusInfo } from "./helpers";
import { ITEMS_PER_PAGE } from "./data";

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

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr className={styles.tableHeaderRow}>
              {["Employee", "Department", "Role", "Status"].map((h) => (
                <th key={h} className={styles.tableHeaderCell}>{h}</th>
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
                <td className={styles.tableCell}><span className={`${styles.roleBadge} ${getRoleColor(u.role)}`}>{u.role}</span></td>
                <td className={styles.tableCell}><span className={`${styles.statusBadge} ${statusInfo(u.status).statusColor}`}>
                  {u.active ? <span className={`${styles.statusDot} ${styles.statusDotActive}`} /> : u.status === "SUSPENDED" ? <span className={`${styles.statusDot} ${styles.statusDotSuspended}`} /> : <span className={`${styles.statusDot} ${styles.statusDotPending}`} />}
                  {u.status}
                </span></td>
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
    </div>
  );
}
