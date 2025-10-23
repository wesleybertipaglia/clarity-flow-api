import { ChatInputWithOptionalAction } from './chat.dto';
import { ChatOutput } from '../../lib/types';
import { definePrompts } from './chat.prompts';

const logger = {
  info: (message: string, data?: any) =>
    console.log(`[CHAT] ${message}`, data ? JSON.stringify(data, null, 2) : ''),
  debug: (message: string, data?: any) =>
    console.log(
      `[CHAT:DEBUG] ${message}`,
      data ? JSON.stringify(data, null, 2) : ''
    ),
  error: (message: string, data?: any) =>
    console.error(
      `[CHAT:ERROR] ${message}`,
      data ? JSON.stringify(data, null, 2) : ''
    ),
  warn: (message: string, data?: any) =>
    console.warn(
      `[CHAT:WARN] ${message}`,
      data ? JSON.stringify(data, null, 2) : ''
    ),
};

export async function handleChatWithGenkit(
  input: ChatInputWithOptionalAction
): Promise<ChatOutput> {
  const requestId = `chat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  if (typeof input.apiKey !== 'string' || input.apiKey.trim().length < 20) {
    logger.error(`❌ Invalid API key [${requestId}]`, {
      apiKeyLength: input.apiKey?.length,
      apiKeyType: typeof input.apiKey,
    });
    throw new Error(
      '❌ Invalid API key. Please provide a valid Google Gemini API key.'
    );
  }

  const {
    contextPrompt,
    createAppointmentPrompt,
    createTaskPrompt,
    createSalePrompt,
    createCompanyPrompt,
    generalQuestionPrompt,
  } = definePrompts(input.apiKey);

  const isAtCommand = input.question.trim().startsWith('@');

  let action = input.action;
  let type = input.type;

  if (isAtCommand && !action && !type) {
    const command = input.question.trim().substring(1).split(' ')[0];
    const parts = command.split('-');
    if (parts.length === 2) {
      const [act, typ] = parts;
      const validActions = ['create', 'read', 'update', 'delete'];
      const validTypes = ['appointment', 'task', 'user', 'sale', 'company'];
      if (validActions.includes(act) && validTypes.includes(typ)) {
        action = act as 'create' | 'read' | 'update' | 'delete';
        type = typ as 'appointment' | 'task' | 'user' | 'sale' | 'company';
        input.question = input.question
          .trim()
          .substring(command.length + 1)
          .trim();
      } else {
        logger.warn(`❌ Invalid @ command [${requestId}]`, { command });
        return {
          answer: `Invalid command: @${command}. Valid commands are like @create-task, @read-appointment, etc.`,
          action: undefined,
          type: undefined,
          data: undefined,
        };
      }
    } else {
      logger.warn(`❌ Malformed @ command [${requestId}]`, { command });
      return {
        answer: `Invalid command format. Use @action-type, like @create-task.`,
        action: undefined,
        type: undefined,
        data: undefined,
      };
    }
  }

  if (action && type) {
    if (!isAtCommand) {
      logger.warn(`❌ Action/type provided without @ command [${requestId}]`);
      return {
        answer: `To perform actions you need to use a valid tool mention like @${action}-${type} ...`,
        action: undefined,
        type: undefined,
        data: undefined,
      };
    }
    logger.info(`📤 Step 1: Determining required context [${requestId}]`);

    const { output: contextSchema } = await contextPrompt({
      question: input.question,
    });

    const filteredContext = filterContext(
      input.context,
      contextSchema,
      requestId
    );

    const modifiedInput = {
      ...input,
      context: filteredContext,
    };

    logger.info(`📤 Step 2: Generating final response [${requestId}]`);

    let response;
    try {
      switch (action + '-' + type) {
        case 'create-appointment':
          response = await createAppointmentPrompt(modifiedInput);
          break;
        case 'create-task':
          response = await createTaskPrompt(modifiedInput);
          break;
        case 'create-sale':
          response = await createSalePrompt(modifiedInput);
          break;
        case 'create-company':
          response = await createCompanyPrompt(modifiedInput);
          break;
        case 'read-appointment':
        case 'read-task':
        case 'read-sale':
        case 'read-company':
        case 'update-appointment':
        case 'update-task':
        case 'update-sale':
        case 'update-company':
        case 'delete-appointment':
        case 'delete-task':
        case 'delete-sale':
        case 'delete-company':
          response = await generalQuestionPrompt(modifiedInput);
          break;

        default:
          logger.error(`❌ Unknown action: ${action}-${type} [${requestId}]`);
          return {
            answer: `Sorry, I don't know how to ${action} ${type}s.`,
            action: undefined,
            type: undefined,
            data: undefined,
          };
      }
    } catch (error) {
      logger.error(`❌ Prompt execution failed [${requestId}]`, error as any);
      return {
        answer: `Sorry, I encountered an error while processing your request.`,
        action: undefined,
        type: undefined,
        data: undefined,
      };
    }

    return {
      answer: response?.output?.answer || '',
      action: response?.output?.action,
      type: response?.output?.type,
      data: response?.output?.data,
    };
  } else if (!action && !type) {
    logger.info(`📤 Step 1: Determining required context [${requestId}]`);

    const { output: contextSchema } = await contextPrompt({
      question: input.question,
    });

    const filteredContext = filterContext(
      input.context,
      contextSchema,
      requestId
    );

    const modifiedInput = {
      ...input,
      context: filteredContext,
    };

    const { output: response } = await generalQuestionPrompt(modifiedInput);

    const finalResponse = response || {
      answer: "I'm sorry, I couldn't generate a response to your question.",
      action: undefined,
      type: undefined,
      data: undefined,
    };

    return finalResponse;
  } else {
    logger.warn(`⚠️ Partial action/type provided [${requestId}]`, {
      action,
      type,
    });
    return {
      answer:
        'Invalid request: both action and type must be provided together.',
      action: undefined,
      type: undefined,
      data: undefined,
    };
  }
}

function filterContext(fullContext: any, schema: any, requestId: string): any {
  const filtered: any = {};

  for (const key of [
    'companies',
    'employees',
    'tasks',
    'sales',
    'appointments',
  ]) {
    if (!schema[key]) {
      continue;
    }

    const criteriaList = schema[key];
    const originalList = fullContext[key];

    if (!Array.isArray(originalList)) {
      logger.warn(`⚠️ ${key} is not an array, setting to empty [${requestId}]`);
      filtered[key] = [];
      continue;
    }

    const includesAll = criteriaList.some((criteria: any) =>
      Object.values(criteria).some((val) => String(val).toLowerCase() === 'all')
    );

    if (includesAll) {
      filtered[key] = originalList;
      continue;
    }

    const filteredList = originalList.filter((item: any) =>
      criteriaList.some((criteria: any) =>
        Object.entries(criteria).every(
          ([field, value]) =>
            item[field] != null &&
            String(item[field])
              .toLowerCase()
              .includes(String(value).toLowerCase())
        )
      )
    );

    logger.info(`✅ ${key} filtered [${requestId}]`, {
      original: originalList.length,
      filtered: filteredList.length,
      reduction: originalList.length - filteredList.length,
    });
    filtered[key] = filteredList;
  }

  if (fullContext.user) {
    filtered.user = fullContext.user;
  }

  return filtered;
}
