import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  }

  async create(data: {
    email: string;
    passwordHash: string;
    name?: string;
  }): Promise<User> {
    return this.prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        passwordHash: data.passwordHash,
        name: data.name,
      },
    });
  }

  async updateProfile(
    userId: string,
    data: { name?: string; avatarUrl?: string | null },
  ): Promise<Omit<User, 'passwordHash'>> {
    const payload = {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.avatarUrl !== undefined && { avatarUrl: data.avatarUrl }),
    };
    if (Object.keys(payload).length === 0) {
      const existing = await this.prisma.user.findUnique({
        where: { id: userId },
      });
      if (!existing) {
        throw new NotFoundException('User not found');
      }
      return this.toPublic(existing);
    }
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: payload,
    });
    const { passwordHash: _, ...safe } = user;
    return safe;
  }

  toPublic(user: User): Omit<User, 'passwordHash'> {
    const { passwordHash: _, ...safe } = user;
    return safe;
  }
}
