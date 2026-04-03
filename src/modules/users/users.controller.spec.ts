import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

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

  const mockJwtPayload = {
    sub: 'admin-id',
    email: 'admin@test.com',
    role: 'ADMIN',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            listUsers: jest.fn().mockResolvedValue(mockUsers),
          },
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
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
  });
});
