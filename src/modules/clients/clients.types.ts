export type NotifyChannel = 'whatsapp' | 'telegram' | 'both';

export type ClientRecord = {
  id: string;
  businessName: string;
  contactName?: string;
  email?: string;
  phoneE164?: string;
  address?: string;
  tags: string[];
  notifyChannel: NotifyChannel;
  telegramChatId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ClientActivityRecord = {
  id: string;
  clientId: string;
  type: string;
  description: string;
  actorId: string;
  timestamp: string;
};
