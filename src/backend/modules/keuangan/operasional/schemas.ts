import { z } from "zod";

export const approvalDataSchema = z.object({
  title: z.string().trim().min(1),
  vendor: z.string().trim().min(1),
  amount: z.number().positive(),
  date: z.iso.date(),
  category: z.string().trim().min(1),
});

export const pettyCashDataSchema = z.object({
  title: z.string().trim().min(1),
  amount: z.number().positive(),
  date: z.iso.date(),
  note: z.string().trim().min(1),
});

export const terminDataSchema = z.object({
  name: z.string().trim().min(1),
  amount: z.number().positive(),
  progress: z.number().min(0).max(100),
  projectName: z.string().trim().min(1),
  clientName: z.string().trim().min(1),
  dueDate: z.iso.date(),
  percentage: z.number().min(0).max(100),
  contractValue: z.number().positive(),
});

export const payrollDataSchema = z.object({
  name: z.string().trim().min(1),
  role: z.string().trim().min(1),
  workers: z.number().int().positive(),
  days: z.number().int().positive(),
  rate: z.number().positive(),
  type: z.enum(["harian", "borongan"]),
});

export const createKeuanganRecordSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("approval"), data: approvalDataSchema }),
  z.object({ kind: z.literal("petty_cash"), data: pettyCashDataSchema }),
  z.object({ kind: z.literal("termin"), data: terminDataSchema }),
  z.object({ kind: z.literal("payroll"), data: payrollDataSchema }),
]);

export const updateKeuanganRecordSchema = createKeuanganRecordSchema;
