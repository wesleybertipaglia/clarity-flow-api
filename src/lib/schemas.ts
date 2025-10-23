import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { FastifySchema } from 'fastify';
import { DEPARTMENTS, ROLES, TASK_STATUSES, SALE_STATUSES } from './types';

export const appointmentSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Title is required'),
  clientIds: z.array(z.string()),
  userIds: z.array(z.string()),
  startTime: z.string(),
  endTime: z.string(),
  companyId: z.string(),
});

export const createAppointmentSchema = appointmentSchema.omit({
  id: true,
  endTime: true,
});
export const updateAppointmentSchema = appointmentSchema
  .partial()
  .omit({ id: true });

export const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  ownerName: z.string().min(1, 'Owner name is required'),
  ownerEmail: z.string().email('Invalid email'),
  ownerPassword: z.string().min(1, 'Password is required'),
});

export const companySchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Name is required'),
  description: z.string(),
});

export const createCompanySchema = companySchema.omit({ id: true });
export const updateCompanySchema = companySchema.partial().omit({ id: true });

export const userSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  email: z.string().email().optional(),
  avatarUrl: z.string().url().optional(),
  companyId: z.string().optional(),
  role: z.enum(ROLES).optional(),
  department: z.enum(DEPARTMENTS).optional(),
});

export const createUserSchema = userSchema.omit({
  id: true,
});
export const updateUserSchema = userSchema.partial().omit({ id: true });

export const saleSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  value: z.number().min(0, 'Value must be positive'),
  status: z.enum(SALE_STATUSES),
  client: z.string().optional(),
  companyId: z.string(),
});

export const createSaleSchema = saleSchema.omit({ id: true });
export const updateSaleSchema = saleSchema.partial().omit({ id: true });

export const taskSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  status: z.enum(TASK_STATUSES),
  dueDate: z.string(),
  assigneeId: z.string(),
  department: z.enum(DEPARTMENTS),
  companyId: z.string(),
});

export const createTaskSchema = taskSchema.omit({ id: true });
export const updateTaskSchema = taskSchema.partial().omit({ id: true });

export const ChatInputSchema = z.object({
  question: z.string().describe("The user's message"),
  context: z
    .object({
      user: userSchema,
      companies: z.array(companySchema).optional(),
      employees: z.array(userSchema).optional(),
      tasks: z.array(taskSchema).optional(),
      sales: z.array(saleSchema).optional(),
      appointments: z.array(appointmentSchema).optional(),
    })
    .describe('Context data for the conversation'),
  action: z
    .enum(['create', 'read', 'update', 'delete'] as const)
    .optional()
    .describe(
      'Action to perform (optional - will be determined from question if not provided)'
    ),
  type: z
    .enum(['appointment', 'task', 'user', 'sale', 'company'] as const)
    .optional()
    .describe(
      'Type of action (optional - will be determined from question if not provided)'
    ),
});

export const ChatOutputSchema = z.object({
  answer: z.string().describe('AI-generated response'),
  action: z
    .string()
    .optional()
    .describe("Action to perform (e.g., 'create', 'read', 'update', 'delete')"),
  type: z
    .string()
    .optional()
    .describe("Type of action (e.g., 'appointment', 'task', 'user')"),
  data: z.any().optional().describe('Data for the action'),
});

export const ChatRouteBodySchema = z.object({
  question: z.string().describe("The user's message"),
  context: z
    .object({
      user: userSchema,
      companies: z.array(companySchema).optional(),
      employees: z.array(userSchema).optional(),
      tasks: z.array(taskSchema).optional(),
      sales: z.array(saleSchema).optional(),
      appointments: z.array(appointmentSchema).optional(),
    })
    .describe('Context data for the conversation'),
  action: z
    .enum(['create', 'read', 'update', 'delete'] as const)
    .optional()
    .describe(
      'Action to perform (optional - will be determined from question if not provided)'
    ),
  type: z
    .enum(['appointment', 'task', 'user', 'sale', 'company'] as const)
    .optional()
    .describe(
      'Type of action (optional - will be determined from question if not provided)'
    ),
});
export type ChatRouteBody = z.infer<typeof ChatRouteBodySchema>;

export const ChatRouteSchema: FastifySchema = {
  body: zodToJsonSchema(ChatRouteBodySchema, 'ChatInput'),
  response: {
    200: zodToJsonSchema(ChatOutputSchema, 'ChatOutput'),
  },
};

export const ContextSchema = z.object({
  companies: z
    .array(z.object({ name: z.string().optional(), id: z.string().optional() }))
    .optional(),
  employees: z
    .array(
      z.object({
        name: z.string().optional(),
        id: z.string().optional(),
        department: z.string().optional(),
      })
    )
    .optional(),
  tasks: z
    .array(
      z.object({
        title: z.string().optional(),
        status: z.string().optional(),
        assigneeId: z.string().optional(),
        department: z.string().optional(),
      })
    )
    .optional(),
  sales: z
    .array(
      z.object({ title: z.string().optional(), value: z.number().optional() })
    )
    .optional(),
  appointments: z
    .array(
      z.object({
        title: z.string().optional(),
        startTime: z.string().optional(),
        endTime: z.string().optional(),
        userId: z.string().optional(),
      })
    )
    .optional(),
});
