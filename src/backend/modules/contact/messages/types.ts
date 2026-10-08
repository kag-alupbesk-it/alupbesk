export interface ContactMessageInput {
  name: string;
  email?: string;
  category: string;
  message: string;
}

export interface ContactMessage extends ContactMessageInput {
  id: string;
  createdAt: string;
}
