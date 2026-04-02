export type AppRole = 'admin' | 'vendedor';

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: AppRole;
  passwordHash: string;
};

export type JwtPayload = {
  sub: string;
  email: string;
  role: AppRole;
};
