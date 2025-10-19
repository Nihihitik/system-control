import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsDateString, MaxLength, IsBoolean } from 'class-validator';

export class UpdateProjectDto {
  @ApiProperty({ description: 'Название проекта', maxLength: 255, required: false })
  @IsString()
  @MaxLength(255)
  @IsOptional()
  name?: string;

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

  @ApiProperty({ description: 'Архивирован ли проект', required: false })
  @IsBoolean()
  @IsOptional()
  isArchived?: boolean;
}
