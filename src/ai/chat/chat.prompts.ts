import { z } from 'zod';
import { createAI } from '../genkit';
import {
  ContextSchema,
  ChatInputSchema,
  ChatOutputSchema,
  createAppointmentSchema,
  createTaskSchema,
  createSaleSchema,
  createCompanySchema,
} from '../../lib/schemas';

export function definePrompts(apiKey: string) {
  const ai = createAI(apiKey);

  const contextPrompt = ai.definePrompt({
    name: 'determineContextPrompt',
    input: {
      schema: z.object({
        question: z.string(),
      }),
    },
    output: { schema: ContextSchema },
    prompt: `
You are an AI assistant responsible for identifying what business context data is required to fulfill a user's request.

User question: {{{question}}}

IMPORTANT: If the question contains "@create-" (like "@create-task", "@create-appointment"), return {} (empty object) because create actions don't need existing context data.

For other actions (@read-, @update-, @delete-), return a JSON object with the following possible keys:
- "companies", "employees", "tasks", "sales", "appointments"

Each key should map to an array of filtering objects (e.g., { name: "X" }, { status: "To Do" }).

If the request mentions "all", include an object like { name: "all" }.

Example for read/update/delete:
{
  "employees": [{ "department": "Marketing" }],
  "tasks": [{ "status": "To Do" }]
}

For create actions, return: {}
    `,
  });

  const createAppointmentPrompt = ai.definePrompt({
    name: 'createAppointmentPrompt',
    input: { schema: ChatInputSchema },
    output: {
      schema: ChatOutputSchema.extend({
        data: createAppointmentSchema,
      }),
    },
    prompt: `
You are a helpful AI assistant for managing business appointments.

Context:
- User: {{{context.user.name}}} (Role: {{{context.user.role}}}, Department: {{{context.user.department}}}, ID: {{{context.user.id}}})
- Employees: {{{context.employees}}}
- Appointments: {{{context.appointments}}}
- Companies: {{{context.companies}}}

User asked:
{{{question}}}

Create a new appointment.
- Set companyId to {{{context.user.companyId}}}
- For userIds: Include the current user's ID {{{context.user.id}}} if "me" is mentioned. For other names, find matching employee IDs from the employees list.
- clientIds: Empty array unless clients are mentioned.
- Parse dates: "tomorrow at 9pm" means the next day at 21:00. Use current date as reference.
- For dates: use the format YYYY-MM-DD. The current year is 2025.
- endTime: Set to startTime + 1 hour.

Return a natural confirmation and the complete appointment data.

Return:
{
  "answer": "Appointment created successfully...",
  "action": "create",
  "type": "appointment",
  "data": { title, startTime, endTime, userIds, clientIds, companyId }
}
     `,
  });

  const createTaskPrompt = ai.definePrompt({
    name: 'createTaskPrompt',
    input: { schema: ChatInputSchema },
    output: {
      schema: ChatOutputSchema.extend({
        data: createTaskSchema,
      }),
    },
    prompt: `
You are a helpful AI assistant for managing tasks.

Context:
- User: {{{context.user.name}}} ({{{context.user.role}}}, {{{context.user.department}}})
- User ID: {{{context.user.id}}}
- Company ID: {{{context.user.companyId}}}
- Employees: {{{context.employees}}}
- Tasks: {{{context.tasks}}}
- Companies: {{{context.companies}}}

User asked:
{{{question}}}

Create a new task based on the user's request.
- Set companyId to {{{context.user.companyId}}}
- If "assign me" or similar, set assigneeId to {{{context.user.id}}}
- Set status to "To Do" if not specified
- For dates: use the format YYYY-MM-DD. If no date is mentioned, set dueDate to 7 days from today, the current year is 2025.
- Department should be {{{context.user.department}}} if not specified

Return a natural confirmation and the complete task data.

Return:
{
  "answer": "Your task has been created successfully...",
  "action": "create",
  "type": "task",
  "data": { title, description, status, dueDate, assigneeId, department, companyId }
}
      `,
  });

  const createSalePrompt = ai.definePrompt({
    name: 'createSalePrompt',
    input: { schema: ChatInputSchema },
    output: {
      schema: ChatOutputSchema.extend({
        data: createSaleSchema,
      }),
    },
    prompt: `
You are creating a new sale entry.

Use the provided context and defaults if needed.

Return:
{
  "answer": "Sale created!",
  "action": "create",
  "type": "sale",
  "data": { title, description, value, status, companyId }
}
    `,
  });

  const createCompanyPrompt = ai.definePrompt({
    name: 'createCompanyPrompt',
    input: { schema: ChatInputSchema },
    output: {
      schema: ChatOutputSchema.extend({
        data: createCompanySchema,
      }),
    },
    prompt: `
You are registering a new company.

Generate a friendly confirmation and the complete company object.

Return:
{
  "answer": "Company created successfully!",
  "action": "create",
  "type": "company",
  "data": { name, description }
}
    `,
  });

  const generalQuestionPrompt = ai.definePrompt({
    name: 'generalQuestionPrompt',
    input: { schema: ChatInputSchema },
    output: {
      schema: ChatOutputSchema,
    },
    prompt: `
You are a helpful AI assistant for business management.

Use the provided context data to answer the user's question directly. If the question asks for summaries, analysis, or specific information about the data (companies, employees, tasks, sales, appointments), analyze that data and provide detailed responses with totals, trends, and key insights.

Context:
- User: {{{context.user.name}}} ({{{context.user.role}}}, {{{context.user.department}}})
- Companies: {{{context.companies}}}
- Employees: {{{context.employees}}}
- Tasks: {{{context.tasks}}}
- Sales: {{{context.sales}}}
- Appointments: {{{context.appointments}}}

User asked:
{{{question}}}

Provide a response based on the context data. If the question cannot be answered with the provided context, give general business advice or ask for clarification.

Return only a conversational response. Do not include any action or data fields.

Return format:
{
  "answer": "Your helpful response here..."
}
    `,
  });

  return {
    contextPrompt,
    createAppointmentPrompt,
    createTaskPrompt,
    createSalePrompt,
    createCompanyPrompt,
    generalQuestionPrompt,
  };
}
