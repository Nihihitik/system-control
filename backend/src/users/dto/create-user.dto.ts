import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'John', description: 'First name' })
  firstName: string;

  @ApiProperty({ example: 'Doe', description: 'Last name' })
  lastName: string;

  @ApiProperty({ example: 'Smith', description: 'Middle name', required: false })
  middleName?: string;

  @ApiProperty({ example: 'john@example.com', description: 'Email address' })
  email: string;

  @ApiProperty({ example: 'SecurePass123!', description: 'Password' })
  password: string;

  @ApiProperty({
    example: 'engineer',
    description: 'User role',
    enum: ['engineer', 'manager', 'observer'],
    default: 'engineer',
  })
  role?: 'engineer' | 'manager' | 'observer';
}
