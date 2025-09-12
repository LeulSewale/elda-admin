// 📁 lib/api/messages.ts
import { api } from "../axios"

export const messagesApi = {
  sendMessage: (data: { customerName: string; subject: string; message: string }) => api.post("/messages", data),
}