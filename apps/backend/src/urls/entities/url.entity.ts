export interface Url {
  id: string;
  originalUrl: string;  
  shortCode: string;
  userId?: string;
  title?: string;
  description?: string;
  clicks: number;
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
} 