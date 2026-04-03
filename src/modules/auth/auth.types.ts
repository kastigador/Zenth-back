export type AppRole = 'admin' | 'vendedor';

export type UserRole = 'dueno' | 'admin' | 'empleado';

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  businessName?: string;
  role: AppRole;
  userRole?: UserRole;
  passwordHash: string;
};

export type JwtPayload = {
  sub: string;
  email: string;
  role: AppRole;
};
