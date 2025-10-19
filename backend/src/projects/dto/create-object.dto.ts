import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, MaxLength } from 'class-validator';

export class CreateObjectDto {
  @ApiProperty({ description: 'ID проекта' })
  @IsInt()
  projectId: number;

  @ApiProperty({ description: 'Название объекта', maxLength: 255 })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiProperty({ description: 'Тип объекта (здание, сооружение, инженерная система)', maxLength: 100, required: false })
  @IsString()
  @MaxLength(100)
  @IsOptional()
  type?: string;

  @ApiProperty({ description: 'Описание объекта', required: false })
  @IsString()
  @IsOptional()
  description?: string;
}
