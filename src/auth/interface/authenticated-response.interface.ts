import { User } from '@prisma/client';

export interface AuthenticatedResponse {
  user: User;
  token: string;
  refresh_token: string;
}
