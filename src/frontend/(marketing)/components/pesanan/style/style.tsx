export const container = "p-10 flex-1";
export const header = "flex justify-between items-start mb-10";
export const title = "text-3xl font-bold text-on-surface mb-2 font-headline tracking-tight";
export const subtitle = "text-on-surface-variant max-w-2xl leading-relaxed";

export const filterBar = "flex flex-wrap items-center gap-4 mb-8";
export const searchCard = "flex-1 min-w-[200px] bg-primary-container border border-outline/30 p-4 rounded-xl flex items-center gap-4";
export const searchIcon = "text-secondary";
export const searchInput = "bg-transparent border-none w-full focus:ring-0 text-sm text-on-surface placeholder:text-on-surface-variant/50";
export const filterCard = "bg-primary-container border border-outline/30 p-4 rounded-xl flex items-center justify-between cursor-pointer hover:border-secondary/50 transition-colors relative min-w-[180px]";
export const filterCardLabel = "text-on-surface-variant text-sm font-semibold";
export const expandIcon = "text-on-surface-variant";
export const dropdown = "absolute top-full left-0 right-0 mt-2 bg-primary-container border border-outline/30 rounded-xl shadow-xl z-10 overflow-hidden";
export const dropdownItem = "w-full text-left px-4 py-3 text-sm text-on-surface hover:bg-surface-variant transition-colors";
export const dropdownActive = "text-secondary font-bold";
export const dropdownInactive = "text-on-surface-variant";

export const tableContainer = "bg-primary-container border border-outline/30 rounded-2xl overflow-hidden shadow-xl";
export const table = "w-full text-left border-collapse";
export const tableHeaderRow = "border-b border-outline/20 bg-surface-variant/40";
export const tableHeaderCell = "px-6 py-5 font-bold text-xs text-on-surface-variant uppercase tracking-widest font-headline";
export const tableHeaderCellRight = "px-6 py-5 font-bold text-xs text-on-surface-variant uppercase tracking-widest font-headline text-right";
export const tableBody = "divide-y divide-outline/15";
export const tableRow = "hover:bg-surface-variant/30 transition-colors cursor-pointer";
export const tableCell = "px-6 py-5";
export const tableCellRight = "px-6 py-5 text-right";

/* Kartu untuk layar kecil (Android) — menggantikan tabel yang perlu scroll horizontal. */
export const mobileList = "md:hidden space-y-3";
export const card = "rounded-xl border border-outline/30 bg-primary-container p-4 shadow-lg";
export const cardTop = "flex items-start justify-between gap-3";
export const cardInfo = "mt-3 space-y-1 text-xs text-on-surface-variant";
export const cardMeta = "mt-3 flex items-center justify-between text-xs";
export const cardActions = "mt-4 flex";
export const desktopOnly = "hidden md:block";

export const newBadge = "ml-2 px-1.5 py-0.5 bg-secondary/20 text-secondary text-[9px] font-bold uppercase rounded-pill animate-pulse";
export const statusBadge = "inline-flex items-center gap-1.5 px-3 py-1 rounded-pill text-[11px] font-bold uppercase tracking-wider";
export const statusDot = "w-1.5 h-1.5 rounded-full";

export const pagination = "flex justify-between items-center mt-6 text-on-surface-variant text-sm";
export const paginationText = "font-medium";
export const paginationHighlight = "text-on-surface";
export const paginationButtons = "flex gap-2";
export const paginationNav = "px-5 py-2 rounded-pill border border-outline/30 text-xs font-bold hover:bg-surface-variant hover:text-on-surface transition-all disabled:opacity-30 disabled:cursor-not-allowed";
export const pageButton = "w-10 h-10 rounded-full text-xs font-bold flex items-center justify-center transition-all";
export const activePage = "bg-secondary text-primary shadow-lg shadow-secondary/20";
export const inactivePage = "border border-outline/30 hover:border-secondary";

export const icon = "material-symbols-outlined";

export const modalOverlay = "fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-3 z-50 animate-fadeIn";
export const modalContent = "bg-primary-container border border-outline/30 rounded-2xl p-5 sm:p-6 w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl animate-scaleIn";
export const modalTitle = "text-xl font-bold text-on-surface mb-2 font-headline";
export const modalSubtitle = "text-sm text-on-surface-variant mb-6";
export const modalCloseButton = "absolute top-4 right-4 text-on-surface-variant hover:text-on-surface transition-colors";
export const modalSection = "mb-6";
export const modalSectionTitle = "text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-3";

export const infoRow = "flex justify-between py-2 text-sm";
export const infoLabel = "text-on-surface-variant";
export const infoValue = "text-on-surface font-bold text-right max-w-[60%]";

export const itemCard = "bg-surface-variant/30 rounded-xl p-4 mb-3 border border-outline/10";
export const itemHeader = "flex justify-between items-start mb-2";
export const itemTitle = "font-bold text-on-surface text-sm";
export const itemQty = "text-xs text-on-surface-variant";
export const itemSubtotal = "text-sm font-bold text-secondary";
export const itemVariants = "flex flex-wrap gap-2 mt-2";
export const variantChip = "px-2 py-0.5 bg-primary-container rounded-pill text-[10px] text-on-surface-variant border border-outline/20";

export const totalRow = "flex justify-between items-center py-4 border-t border-outline/20 mt-4";
export const totalLabel = "text-base font-bold text-on-surface";
export const totalValue = "text-xl font-bold text-secondary font-headline";

export const actionsWrapper = "flex gap-3 mt-8 pt-6 border-t border-outline/20";
export const primaryButton = "flex-1 py-3 bg-secondary text-primary font-bold rounded-pill text-sm hover:brightness-110 transition-all flex items-center justify-center gap-2";
export const secondaryButton = "flex-1 py-3 min-h-11 md:min-h-0 flex items-center justify-center border border-outline/30 rounded-pill text-on-surface-variant font-bold text-sm hover:bg-surface-variant transition-colors";
export const dangerButton = "flex-1 py-3 min-h-11 md:min-h-0 flex items-center justify-center border border-red-400/30 text-red-400 font-bold rounded-pill text-sm hover:bg-red-400/10 transition-colors";

export const confirmIcon = "w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-4";
export const confirmTitle = "text-lg font-bold text-on-surface text-center mb-2 font-headline";
export const confirmText = "text-sm text-on-surface-variant text-center mb-6 max-w-md mx-auto";
