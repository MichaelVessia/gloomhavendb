import { UserLite } from '../../shared/types/user-lite';

export interface JwtPayload {
  email: string;
  user: UserLite;
  readonly exp?: number;
  readonly iat?: number;
}
