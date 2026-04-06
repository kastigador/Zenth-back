import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { JwtPayload } from '../auth/auth.types';
import { ROLES_KEY } from '../auth/roles.decorator';
import { STORAGE_PORT } from '../storage/storage.port';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;
  let storage: any;

  const mockUsers = [
    {
      id: 'user1',
      name: 'Admin User',
      email: 'admin@test.com',
      role: 'ADMIN',
      createdAt: new Date(),
    },
    {
      id: 'user2',
      name: 'Seller User',
      email: 'seller@test.com',
      role: 'SELLER',
      createdAt: new Date(),
    },
  ];

  const mockJwtPayload: JwtPayload = {
    sub: 'admin-id',
    email: 'admin@test.com',
    role: 'admin',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            listUsers: jest.fn().mockResolvedValue(mockUsers),
            updateMyAvatar: jest.fn().mockResolvedValue({
              id: 'admin-id',
              name: 'Admin User',
              email: 'admin@test.com',
              avatarUrl: 'http://localhost:3000/assets/users/admin-id/avatar/demo.jpg',
              role: 'ADMIN',
            }),
          },
        },
        {
          provide: STORAGE_PORT,
          useValue: {
            put: jest.fn().mockResolvedValue({
              key: 'users/admin-id/avatar/demo.jpg',
              url: 'http://localhost:3000/assets/users/admin-id/avatar/demo.jpg',
              sizeBytes: 12,
              mimeType: 'image/jpeg',
            }),
            getPublicUrl: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
    storage = module.get(STORAGE_PORT);
  });

  describe('list', () => {
    it('debe llamar al servicio y retornar lista de usuarios', async () => {
      const result = await controller.list(mockJwtPayload);

      expect(service.listUsers).toHaveBeenCalled();
      expect(result).toEqual({
        requestedBy: 'admin@test.com',
        items: mockUsers,
        total: 2,
      });
    });

    it('debe retornar estructura con requestedBy, items y total', async () => {
      const result = await controller.list(mockJwtPayload);

      expect(result).toHaveProperty('requestedBy');
      expect(result).toHaveProperty('items');
      expect(result).toHaveProperty('total');
      expect(result.requestedBy).toBe('admin@test.com');
      expect(result.total).toBe(2);
    });

    it('debe permitir acceso a admin y vendedor por metadata de roles', () => {
      const roles = Reflect.getMetadata(ROLES_KEY, UsersController.prototype.list);
      expect(roles).toEqual(['admin', 'vendedor']);
    });
  });

  describe('updateMyAvatar', () => {
    it('actualiza avatar del usuario autenticado', async () => {
      const result = await controller.updateMyAvatar(mockJwtPayload, {
        avatarUrl: 'http://localhost:3000/assets/users/admin-id/avatar/custom.jpg',
      });

      expect((service as any).updateMyAvatar).toHaveBeenCalledWith(
        'admin-id',
        'http://localhost:3000/assets/users/admin-id/avatar/custom.jpg',
      );
      expect(result.avatarUrl).toContain('/assets/users/admin-id/avatar/');
    });
  });

  describe('uploadMyAvatar', () => {
    it('sube avatar base64 y persiste avatarUrl', async () => {
      const result = await controller.uploadMyAvatar(mockJwtPayload, {
        fileName: 'avatar.jpg',
        mimeType: 'image/jpeg',
        base64: Buffer.from('avatar-demo').toString('base64'),
      });

      expect(storage.put).toHaveBeenCalled();
      expect((service as any).updateMyAvatar).toHaveBeenCalledWith(
        'admin-id',
        'http://localhost:3000/assets/users/admin-id/avatar/demo.jpg',
      );
      expect(result.file.url).toContain('/assets/users/admin-id/avatar/');
    });

    it('rechaza upload cuando base64 está vacío', async () => {
      await expect(
        controller.uploadMyAvatar(mockJwtPayload, {
          fileName: 'avatar.jpg',
          mimeType: 'image/jpeg',
          base64: '',
        } as any),
      ).rejects.toThrow('base64 is required');
    });
  });
});
