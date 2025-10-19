import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsDateString, MaxLength } from 'class-validator';

export class CreateProjectDto {
  @ApiProperty({ description: 'Название проекта', maxLength: 255 })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiProperty({ description: 'Описание проекта', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Дата начала проекта', required: false })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiProperty({ description: 'Плановая дата завершения проекта', required: false })
  @IsDateString()
  @IsOptional()
  endDate?: string;
}
