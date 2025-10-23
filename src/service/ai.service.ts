import { ChatInputWithOptionalAction } from '../ai/chat/chat.dto';
import { ChatOutput } from '../lib/types';
import { handleChatWithGenkit } from '../ai/chat/chat.flow';

export default class AiService {
  async handleChat(data: ChatInputWithOptionalAction): Promise<ChatOutput> {
    return handleChatWithGenkit(data);
  }
}
