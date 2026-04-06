import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../../common/prisma.service';

describe('UsersService', () => {
  let service: UsersService;
  let prismaService: PrismaService;

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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findMany: jest.fn().mockResolvedValue(mockUsers),
            },
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  describe('listUsers', () => {
    it('debe retornar lista de usuarios activos ordenados por nombre', async () => {
      const result = await service.listUsers();

      expect(prismaService.user.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
          role: true,
          createdAt: true,
        },
        orderBy: { name: 'asc' },
      });

      expect(result).toEqual(mockUsers);
      expect(result).toHaveLength(2);
    });

    it('debe contener usuarios con propiedades correctas', async () => {
      const result = await service.listUsers();

      result.forEach((user) => {
        expect(user).toHaveProperty('id');
        expect(user).toHaveProperty('name');
        expect(user).toHaveProperty('email');
        expect(user).toHaveProperty('role');
        expect(user).toHaveProperty('createdAt');
      });
    });
  });

  describe('updateMyAvatar', () => {
    it('debe actualizar avatarUrl del usuario autenticado', async () => {
      const updated = {
        id: 'user1',
        name: 'Admin User',
        email: 'admin@test.com',
        avatarUrl: 'http://localhost:3000/assets/users/user1/avatar/demo.jpg',
        role: 'ADMIN',
      };

      (prismaService.user as any).update = jest.fn().mockResolvedValue(updated);

      const result = await service.updateMyAvatar('user1', updated.avatarUrl);

      expect((prismaService.user as any).update).toHaveBeenCalledWith({
        where: { id: 'user1' },
        data: { avatarUrl: updated.avatarUrl },
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
          role: true,
        },
      });
      expect(result).toEqual(updated);
    });
  });
});
