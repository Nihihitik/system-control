import { Injectable } from '@nestjs/common';
import { User, UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    return this.prisma.user.create({
      data: {
        firstName: createUserDto.firstName,
        lastName: createUserDto.lastName,
        middleName: createUserDto.middleName,
        email: createUserDto.email,
        password: createUserDto.password,
        role: createUserDto.role || 'engineer',
      },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findByEmailWithRole(email: string, role?: UserRole) {
    return this.prisma.user.findFirst({
      where: {
        email,
        ...(role && { role }),
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        middleName: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findById(id: number): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async findEngineers() {
    return this.prisma.user.findMany({
      where: {
        role: 'engineer',
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        middleName: true,
        email: true,
        role: true,
      },
      orderBy: {
        lastName: 'asc',
      },
    });
  }

  // Engineers that are assigned to projects of a specific manager
  async findEngineersForManager(managerId: number) {
    return this.prisma.user.findMany({
      where: {
        role: 'engineer',
        engineerProjects: {
          some: {
            managers: {
              some: { id: managerId },
            },
          },
        },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        middleName: true,
        email: true,
        role: true,
      },
      orderBy: {
        lastName: 'asc',
      },
    });
  }

  async findManagers() {
    return this.prisma.user.findMany({
      where: {
        role: 'manager',
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        middleName: true,
        email: true,
        role: true,
      },
      orderBy: {
        lastName: 'asc',
      },
    });
  }

  async findObservers() {
    return this.prisma.user.findMany({
      where: {
        role: 'observer',
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        middleName: true,
        email: true,
        role: true,
      },
      orderBy: {
        lastName: 'asc',
      },
    });
  }
}
