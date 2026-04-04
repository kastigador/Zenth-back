import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayload } from './auth.types';

export function extractCurrentUser(context: ExecutionContext): JwtPayload | undefined {
  const request = context.switchToHttp().getRequest<{ user?: JwtPayload }>();
  return request.user;
}

export const CurrentUser = createParamDecorator((_: unknown, context: ExecutionContext): JwtPayload | undefined =>
  extractCurrentUser(context),
);
