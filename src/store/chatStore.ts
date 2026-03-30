import { create } from 'zustand'
import type { ChatMessage } from '../types'
import { generateId } from '../lib/utils'
import { chat as chatAPI } from '../lib/api'
import { mockAIRespond } from '../lib/mock-ai'

interface ChatState {
  conversationId: string | null
  messages: ChatMessage[]
  isTyping: boolean
  sendMessage: (content: string) => Promise<void>
  clearChat: () => void
  loadConversation: (id?: string) => Promise<void>
}

const welcomeMessage: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content: "Namaste! I'm V-Care, your AI health assistant at AyushmanLife. I can help you with:\n\n- **Book appointments** with specialists\n- **Check symptoms** and get triage guidance\n- **Medication reminders** and information\n- **Insurance queries** and claim status\n- **Health tips** and preventive care\n\nHow can I assist you today?",
  timestamp: new Date().toISOString(),
  type: 'text',
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversationId: null,
  messages: [welcomeMessage],
  isTyping: false,

  loadConversation: async (id?: string) => {
    try {
      if (id) {
        const { messages } = await chatAPI.messages(id)
        const mapped: ChatMessage[] = messages.map(m => ({
          id: m.id,
          role: m.role as 'user' | 'assistant',
          content: m.content,
          timestamp: m.created_at,
          type: (m.message_type || 'text') as ChatMessage['type'],
        }))
        set({ conversationId: id, messages: mapped.length > 0 ? mapped : [welcomeMessage] })
      } else {
        // Create new conversation
        const { conversation } = await chatAPI.createConversation({ title: 'New Chat', mode: 'general' })
        set({ conversationId: conversation.id, messages: [welcomeMessage] })
      }
    } catch {
      // API unavailable — use local mode
      set({ conversationId: 'local-' + Date.now(), messages: [welcomeMessage] })
    }
  },

  sendMessage: async (content: string) => {
    const userMsg: ChatMessage = {
      id: generateId(),
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
      type: 'text',
    }
    set((s) => ({ messages: [...s.messages, userMsg], isTyping: true }))

    const convId = get().conversationId

    try {
      if (convId && !convId.startsWith('local-')) {
        // Real API call
        const { assistantMessage } = await chatAPI.send(convId, content)
        const mapped: ChatMessage = {
          id: assistantMessage.id,
          role: 'assistant',
          content: assistantMessage.content,
          timestamp: assistantMessage.created_at,
          type: (assistantMessage.message_type || 'text') as ChatMessage['type'],
        }
        set((s) => ({ messages: [...s.messages, mapped], isTyping: false }))
        return
      }
    } catch {
      // Fall through to mock
    }

    // Mock fallback
    const response = mockAIRespond(content, get().messages)
    set((s) => ({ messages: [...s.messages, response], isTyping: false }))
  },

  clearChat: () => {
    set({ conversationId: null, messages: [welcomeMessage], isTyping: false })
  },
}))
