import { ROLES_KEY, Roles } from './roles.decorator';

describe('Roles decorator', () => {
  it('define metadata de roles en método', () => {
    class TestController {
      @Roles('admin', 'vendedor')
      handler() {
        return true;
      }
    }

    const metadata = Reflect.getMetadata(ROLES_KEY, TestController.prototype.handler);

    expect(metadata).toEqual(['admin', 'vendedor']);
  });
});
