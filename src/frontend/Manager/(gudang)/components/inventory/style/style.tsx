// Gaya modul Gudang Inventaris (Master Stok / Barang Masuk / Barang Keluar).

// --- Layout ---
export const container = "p-3 sm:p-4 md:p-10 min-h-screen";
export const wrapper = "mx-auto max-w-7xl";
export const header = "mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between";
export const headerTitle =
  "text-xl lg:text-2xl font-extrabold text-on-surface tracking-tight uppercase font-headline";
export const headerSubtitle = "mt-1 text-xs text-on-surface-variant";
export const headerActions = "flex flex-wrap items-center gap-2";

// --- Buttons ---
export const primaryButton =
  "flex items-center gap-2 px-4 py-2.5 rounded-lg bg-secondary hover:brightness-110 text-on-secondary text-xs font-bold transition-all shadow-lg shadow-secondary/20 disabled:opacity-50 disabled:cursor-not-allowed";
export const ghostButton =
  "flex items-center gap-2 px-4 py-2.5 rounded-lg bg-surface-variant hover:bg-surface-container-high text-on-surface text-xs font-semibold transition-all border border-outline/30 disabled:opacity-50";
export const dangerButton =
  "flex items-center gap-2 px-4 py-2.5 rounded-lg bg-error hover:brightness-110 text-white text-xs font-bold transition-all shadow-lg shadow-error/20 disabled:opacity-50";
export const buttonIcon = "material-symbols-outlined text-[18px]";

// --- Metrics ---
export const metricsRow = "mb-6 grid grid-cols-2 lg:grid-cols-4 gap-3";
export const metricCard =
  "flex items-center gap-3 rounded-xl border border-outline/30 bg-primary-container px-4 py-3 shadow-md";
export const metricIcon =
  "flex h-9 w-9 items-center justify-center rounded-lg bg-secondary/10 text-secondary";
export const metricIconAlt =
  "flex h-9 w-9 items-center justify-center rounded-lg bg-surface-variant text-on-surface-variant";
export const metricLabel = "text-[9px] font-bold tracking-widest text-on-surface-variant uppercase";
export const metricValue = "text-lg font-bold text-secondary font-headline";
export const metricValueAlt = "text-lg font-bold text-on-surface font-headline";

// --- Tabs ---
export const tabs = "mb-6 flex flex-wrap gap-1 border-b border-outline/20";
export const tab = "px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest transition-all rounded-t-lg";
export const tabActive = "text-secondary border-b-2 border-secondary bg-secondary/5";
export const tabInactive = "text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/40";

// --- Table ---
export const tableCard =
  "rounded-xl border border-outline/30 bg-primary-container shadow-2xl overflow-hidden";
export const tableToolbar =
  "flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between border-b border-outline/20 bg-surface-variant/30";
export const searchWrapper = "relative flex-1 max-w-sm";
export const searchIcon =
  "material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px] pointer-events-none";
export const searchInput =
  "w-full rounded-pill border border-outline/30 bg-surface-variant pl-9 pr-4 py-2 text-xs text-on-surface placeholder:text-on-surface-variant focus:ring-1 focus:ring-secondary focus:border-secondary transition-all outline-none";
export const filterGroup = "flex flex-wrap items-center gap-3";
export const filterLabel = "text-[10px] text-on-surface-variant font-bold uppercase tracking-widest whitespace-nowrap";
export const filterSelect =
  "rounded-lg border border-outline/30 bg-surface-variant px-3 py-2 text-xs text-on-surface transition-all focus:border-secondary focus:ring-1 focus:ring-secondary outline-none";
export const tableWrapper = "overflow-x-auto";
export const table = "w-full text-left text-sm";
export const tableHead =
  "bg-surface-variant/50 text-[9px] lg:text-[10px] font-bold uppercase tracking-widest text-on-surface-variant border-b border-outline/20";
export const th = "px-4 py-3";
export const thRight = "px-4 py-3 text-right";
export const tbody = "divide-y divide-outline/15";
export const row = "hover:bg-surface-variant/40 transition-colors";
export const td = "px-4 py-3";
export const tdRight = "px-4 py-3 text-right";
export const emptyCell = "px-6 py-12 text-center text-on-surface-variant text-xs";
export const nameText = "text-xs font-semibold text-on-surface";
export const subText = "text-[10px] text-on-surface-variant";
export const modelText = "font-mono text-xs font-bold text-secondary";
export const badge =
  "inline-block rounded bg-surface-variant px-2.5 py-1 text-[10px] font-bold text-on-surface-variant border border-outline/30 uppercase tracking-wide";
export const categoryBadge =
  "inline-block rounded-full bg-secondary/10 px-2.5 py-1 text-[10px] font-bold text-secondary border border-secondary/20 uppercase tracking-wide";
export const stockText = "text-base font-bold text-on-surface";
export const stockLow = "text-base font-bold text-error";
export const iconButton =
  "flex items-center justify-center w-8 h-8 rounded-lg text-on-surface-variant transition-all";
export const editButton = `${iconButton} hover:text-secondary hover:bg-secondary/10`;
export const deleteButton = `${iconButton} hover:text-error hover:bg-error/10`;
export const actionCell = "flex items-center justify-end gap-1";
export const iconSm = "material-symbols-outlined text-[16px]";
export const footer =
  "border-t border-outline/20 px-4 py-3 bg-surface-variant/30 flex items-center justify-between";
export const footerText = "text-[10px] text-on-surface-variant";

// --- Modal ---
export const modalBackdrop =
  "fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-3";
export const modalContent =
  "bg-primary-container border border-outline/30 rounded-2xl p-5 sm:p-6 shadow-2xl max-w-lg w-full text-on-surface max-h-[92vh] overflow-y-auto";
export const modalHeader = "flex items-center justify-between mb-6";
export const modalTitle =
  "text-base font-extrabold text-on-surface uppercase tracking-tight font-headline";
export const modalSubtitle = "text-[10px] text-on-surface-variant mt-0.5";
export const modalCloseButton =
  "text-on-surface-variant hover:text-on-surface transition-colors p-1 rounded-lg hover:bg-surface-variant";
export const closeIcon = "material-symbols-outlined text-[20px]";
export const formGroup = "space-y-4";
export const formLabel = "text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1.5 block";
export const required = "text-error";
export const formInput =
  "w-full rounded-lg border border-outline/30 bg-surface-variant px-3 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all";
export const formError = "text-error text-[10px] mt-1";
export const formHint = "text-on-surface-variant text-[10px] mt-1";
export const formGrid = "grid grid-cols-1 sm:grid-cols-2 gap-3";
export const itemDetailBox = "rounded-lg border border-outline/30 bg-surface-variant/40 p-3";
export const itemDetailGrid = "grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5";
export const itemDetailRow = "flex items-start justify-between gap-3 text-[11px]";
export const itemDetailLabel = "font-bold uppercase tracking-widest text-on-surface-variant";
export const itemDetailValue = "text-right font-semibold text-on-surface";
export const itemDetailStatus = "mb-2 text-[11px] font-semibold text-secondary";
export const modalFooter = "flex items-center justify-end gap-3 mt-6 pt-4 border-t border-outline/20";
export const cancelButton =
  "px-4 py-2.5 rounded-lg bg-surface-variant hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface text-sm font-medium transition-all border border-outline/30";
export const saveButton =
  "px-5 py-2.5 rounded-lg bg-secondary hover:brightness-110 text-on-secondary text-sm font-bold transition-all shadow-lg shadow-secondary/20 disabled:opacity-50";

// --- Helpers ---
export const errorBanner =
  "mb-4 rounded-lg border border-error/30 bg-error/10 px-4 py-2.5 text-xs text-error";
export const successBanner =
  "mb-4 rounded-lg border border-success/30 bg-success/10 px-4 py-2.5 text-xs text-success";
export const loadingState = "py-16 text-center text-xs text-on-surface-variant";

// --- Permintaan Produksi ---
export const requestList = "space-y-3";
export const requestCard =
  "rounded-xl border border-outline/30 bg-primary-container shadow-lg overflow-hidden";
export const requestCardHeader =
  "flex flex-col gap-2 p-4 md:flex-row md:items-center md:justify-between border-b border-outline/20 bg-surface-variant/30";
export const requestTitle =
  "text-sm font-bold text-on-surface font-headline";
export const requestMeta = "mt-0.5 text-[10px] text-on-surface-variant";
export const requestActions = "flex flex-wrap items-center gap-2";
export const approveButton =
  "flex items-center gap-1.5 px-3 py-2 rounded-lg bg-secondary hover:brightness-110 text-on-secondary text-[11px] font-bold transition-all disabled:opacity-50";
export const rejectButton =
  "flex items-center gap-1.5 px-3 py-2 rounded-lg bg-error/10 hover:bg-error/20 text-error text-[11px] font-bold transition-all border border-error/30 disabled:opacity-50";
export const statusPending =
  "inline-block rounded-full bg-secondary/15 px-2.5 py-1 text-[10px] font-bold text-secondary border border-secondary/30 uppercase tracking-wide";
export const statusApproved =
  "inline-block rounded-full bg-success/15 px-2.5 py-1 text-[10px] font-bold text-success border border-success/30 uppercase tracking-wide";
export const statusRejected =
  "inline-block rounded-full bg-error/15 px-2.5 py-1 text-[10px] font-bold text-error border border-error/30 uppercase tracking-wide";
export const requestNote =
  "px-4 py-2 text-[11px] text-on-surface-variant border-b border-outline/15 bg-surface-variant/10";
export const textarea =
  "w-full rounded-lg border border-outline/30 bg-surface-variant px-3 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all resize-none";
