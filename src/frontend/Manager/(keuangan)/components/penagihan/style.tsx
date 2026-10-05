// --- Penagihan section ---
export const container = "p-3 sm:p-4 md:p-10 min-h-screen"
export const wrapper = "mx-auto max-w-7xl"
export const header = "mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between"
export const headerTitle = "text-xl lg:text-2xl font-extrabold text-on-surface tracking-tight uppercase font-headline"
export const badge = "rounded-full bg-secondary/10 px-3 py-1 text-[10px] font-bold text-secondary border border-secondary/20 uppercase tracking-widest"
export const headerSubtitle = "mt-1 text-xs text-on-surface-variant"

export const cardGrid = "grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8"
export const metricCard = "rounded-xl border border-outline/30 bg-primary-container p-4 shadow-md flex items-center gap-3"
export const metricIcon = "flex h-9 w-9 items-center justify-center rounded-lg bg-secondary/10 text-secondary shrink-0"
export const metricIconOut = "flex h-9 w-9 items-center justify-center rounded-lg bg-error/10 text-error shrink-0"
export const metricIconOk = "flex h-9 w-9 items-center justify-center rounded-lg bg-success/10 text-success shrink-0"
export const metricLabel = "text-[9px] font-bold tracking-widest text-on-surface-variant uppercase"
export const metricValue = "text-lg lg:text-xl font-bold text-on-surface font-headline"

export const tableCard = "rounded-xl border border-outline/30 bg-primary-container shadow-2xl overflow-hidden"
export const tableToolbar = "flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between border-b border-outline/20 bg-surface-variant/30"
export const filterGroup = "flex items-center gap-2"
export const filterSelect = "rounded-lg border border-outline/30 bg-surface-variant px-3 py-2 text-xs text-on-surface transition-all focus:border-secondary focus:ring-1 focus:ring-secondary outline-none"
export const tableWrapper = "w-full overflow-x-auto"
export const table = "w-full min-w-[760px] text-left text-sm"
export const tableHead = "bg-surface-variant/50 text-[9px] lg:text-[10px] font-bold uppercase tracking-widest text-on-surface-variant border-b border-outline/20"
export const tableHeadCell = "px-4 py-3"
export const tableRow = "border-b border-outline/10 transition-colors hover:bg-surface-variant/30"
export const tableCell = "px-4 py-3 text-xs text-on-surface"
export const badgeBase = "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest"
export const belumBadge = "bg-error/10 text-error border-error/20"
export const lunasBadge = "bg-success/10 text-success border-success/20"
export const lunasButton = "flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-success/10 hover:bg-success/20 text-success text-[10px] font-bold uppercase tracking-widest transition-all disabled:opacity-40 disabled:cursor-default disabled:hover:bg-success/10"
export const lunasDone = "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-on-surface-variant text-[10px] font-bold uppercase tracking-widest"
export const kategoriBadge: Record<string, string> = {
  eceran: "bg-secondary/10 text-secondary border-secondary/20",
  proyek: "bg-tertiary/10 text-tertiary border-tertiary/20",
}
export const emptyState = "px-4 py-10 text-center text-xs text-on-surface-variant"
