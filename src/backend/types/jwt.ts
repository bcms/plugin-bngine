import type { JWT } from '@becomes/purple-cheetah-mod-jwt/types';

export type JWTProps = JWT<MyJWT>;

export interface MyJWT {
  email: string;
}
