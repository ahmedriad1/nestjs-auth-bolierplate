import { User } from '../../user/user.entity';

export interface AuthenticatedResponse {
  user: User;
  token: string;
  refresh_token: string;
}
