import { ExecutionContext } from '@nestjs/common';
import { extractCurrentUser } from './current-user.decorator';

describe('CurrentUser decorator', () => {
  it('retorna req.user desde el contexto HTTP', () => {
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({
          user: { sub: 'u1', email: 'u1@test.com', role: 'admin' },
        }),
      }),
    } as unknown as ExecutionContext;

    const result = extractCurrentUser(context);

    expect(result).toEqual({ sub: 'u1', email: 'u1@test.com', role: 'admin' });
  });
});
