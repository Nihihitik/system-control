import { Controller, Get, UseGuards, Query, NotFoundException, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('engineers')
  @Roles('manager')
  @ApiOperation({ summary: 'Получить список инженеров по проектам менеджера (только Manager)' })
  @ApiResponse({ status: 200, description: 'Список инженеров' })
  @ApiResponse({ status: 403, description: 'Недостаточно прав' })
  getEngineers(@Request() req: any) {
    return this.usersService.findEngineersForManager(req.user.sub);
  }

  @Get('managers')
  @Roles('manager')
  @ApiOperation({ summary: 'Получить список всех менеджеров' })
  @ApiResponse({ status: 200, description: 'Список менеджеров' })
  @ApiResponse({ status: 403, description: 'Недостаточно прав' })
  getManagers() {
    return this.usersService.findManagers();
  }

  @Get('observers')
  @Roles('manager')
  @ApiOperation({ summary: 'Получить список всех наблюдателей' })
  @ApiResponse({ status: 200, description: 'Список наблюдателей' })
  @ApiResponse({ status: 403, description: 'Недостаточно прав' })
  getObservers() {
    return this.usersService.findObservers();
  }

  @Get('search')
  @Roles('manager')
  @ApiOperation({ summary: 'Найти пользователя по email' })
  @ApiQuery({ name: 'email', required: true, description: 'Email пользователя' })
  @ApiQuery({ name: 'role', required: false, enum: ['engineer', 'manager', 'observer'], description: 'Роль пользователя' })
  @ApiResponse({ status: 200, description: 'Пользователь найден' })
  @ApiResponse({ status: 404, description: 'Пользователь не найден' })
  @ApiResponse({ status: 403, description: 'Недостаточно прав' })
  async searchByEmail(
    @Query('email') email: string,
    @Query('role') role?: UserRole,
  ) {
    const user = await this.usersService.findByEmailWithRole(email, role);
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }
    return user;
  }
}
