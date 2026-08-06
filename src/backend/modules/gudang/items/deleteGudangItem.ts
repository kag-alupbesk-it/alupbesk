import { gudangItems } from "./store";
export function deleteGudangItem(id: string): boolean { return gudangItems.delete(id); }
