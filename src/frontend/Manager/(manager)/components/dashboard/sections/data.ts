import type { RegistrationStatus } from "./types";

export const initialRegistrations: { name: string; dept: string; date: string; initial: string; status: RegistrationStatus }[] = [
  { name: "-", dept: "-", date: "-", initial: "-", status: "pending" },
];
