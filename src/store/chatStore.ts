import { create } from 'zustand'
import type { ChatMessage } from '../types'
import { generateId, sleep } from '../lib/utils'
import { mockAIRespond } from '../lib/mock-ai'

interface ChatState {
  messages: ChatMessage[]
  isTyping: boolean
  sendMessage: (content: string) => Promise<void>
  clearChat: () => void
}

const welcomeMessage: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content: "Namaste! 🙏 I'm V-Care, your AI health assistant at AyushmanLife. I can help you with:\n\n• **Book appointments** with specialists\n• **Check symptoms** and get triage guidance\n• **Medication reminders** and information\n• **Insurance queries** and claim status\n• **Health tips** and preventive care\n\nHow can I assist you today?",
  timestamp: new Date().toISOString(),
  type: 'text',
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [welcomeMessage],
  isTyping: false,
  sendMessage: async (content: string) => {
    const userMsg: ChatMessage = {
      id: generateId(),
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
      type: 'text',
    }
    set((s) => ({ messages: [...s.messages, userMsg], isTyping: true }))
    await sleep(1000 + Math.random() * 1500)
    const response = mockAIRespond(content, get().messages)
    set((s) => ({ messages: [...s.messages, response], isTyping: false }))
  },
  clearChat: () => set({ messages: [welcomeMessage], isTyping: false }),
}))
