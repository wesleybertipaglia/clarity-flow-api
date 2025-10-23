import { z } from 'zod';
import {
  ChatInputSchema,
  ChatOutputSchema,
  companySchema,
  userSchema,
  taskSchema,
  saleSchema,
  appointmentSchema,
} from './schemas';

export type Role = 'Owner' | 'Manager' | 'Employee';
export type Department =
  | 'HR'
  | 'Marketing'
  | 'Engineering'
  | 'Admin'
  | 'Sales'
  | 'General';
export type TaskStatus = 'To Do' | 'In Progress' | 'Done';
export type SaleStatus = 'Pending' | 'Processing' | 'Finished' | 'Canceled';

export const ROLES = ['Owner', 'Manager', 'Employee'] as const;
export const DEPARTMENTS = [
  'HR',
  'Marketing',
  'Engineering',
  'Admin',
  'Sales',
  'General',
] as const;
export const TASK_STATUSES = ['To Do', 'In Progress', 'Done'] as const;
export const SALE_STATUSES = [
  'Pending',
  'Processing',
  'Finished',
  'Canceled',
] as const;

export type Company = z.infer<typeof companySchema>;
export type User = z.infer<typeof userSchema>;
export type Task = z.infer<typeof taskSchema>;
export type Sale = z.infer<typeof saleSchema>;
export type Appointment = z.infer<typeof appointmentSchema>;

export type ChatInput = z.infer<typeof ChatInputSchema>;
export type ChatOutput = z.infer<typeof ChatOutputSchema>;
