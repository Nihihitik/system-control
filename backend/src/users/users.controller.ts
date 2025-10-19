import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('engineers')
  @Roles('manager')
  @ApiOperation({ summary: 'Получить список всех инженеров (только Manager)' })
  @ApiResponse({ status: 200, description: 'Список инженеров' })
  @ApiResponse({ status: 403, description: 'Недостаточно прав' })
  getEngineers() {
    return this.usersService.findEngineers();
  }
}
