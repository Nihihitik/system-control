import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsInt, IsDateString, IsArray, IsString } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { DefectStatus, DefectPriority } from '@prisma/client';

export class DefectFilterDto {
  @ApiProperty({ description: 'Номер страницы', required: false, default: 1 })
  @IsInt()
  @Type(() => Number)
  @IsOptional()
  page?: number = 1;

  @ApiProperty({
    description: 'Количество записей на странице',
    required: false,
    default: 25,
    enum: [10, 25, 50, 100]
  })
  @IsInt()
  @Type(() => Number)
  @IsOptional()
  limit?: number = 25;

  @ApiProperty({
    description: 'Фильтр по статусам (можно указать несколько через запятую)',
    enum: DefectStatus,
    required: false,
    isArray: true
  })
  @IsArray()
  @IsEnum(DefectStatus, { each: true })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.split(',').map(v => v.trim());
    }
    return value;
  })
  @IsOptional()
  statuses?: DefectStatus[];

  @ApiProperty({
    description: 'Фильтр по приоритетам (можно указать несколько через запятую)',
    enum: DefectPriority,
    required: false,
    isArray: true
  })
  @IsArray()
  @IsEnum(DefectPriority, { each: true })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.split(',').map(v => v.trim());
    }
    return value;
  })
  @IsOptional()
  priorities?: DefectPriority[];

  @ApiProperty({ description: 'ID исполнителя', required: false })
  @IsInt()
  @Type(() => Number)
  @IsOptional()
  assigneeId?: number;

  @ApiProperty({ description: 'ID автора', required: false })
  @IsInt()
  @Type(() => Number)
  @IsOptional()
  authorId?: number;

  @ApiProperty({ description: 'ID проекта', required: false })
  @IsInt()
  @Type(() => Number)
  @IsOptional()
  projectId?: number;

  @ApiProperty({ description: 'ID объекта строительства', required: false })
  @IsInt()
  @Type(() => Number)
  @IsOptional()
  buildingObjectId?: number;

  @ApiProperty({ description: 'ID этапа работ', required: false })
  @IsInt()
  @Type(() => Number)
  @IsOptional()
  stageId?: number;

  @ApiProperty({ description: 'Начальная дата создания (фильтр от)', required: false })
  @IsDateString()
  @IsOptional()
  createdFrom?: string;

  @ApiProperty({ description: 'Конечная дата создания (фильтр до)', required: false })
  @IsDateString()
  @IsOptional()
  createdTo?: string;

  @ApiProperty({ description: 'Начальная плановая дата (фильтр от)', required: false })
  @IsDateString()
  @IsOptional()
  plannedFrom?: string;

  @ApiProperty({ description: 'Конечная плановая дата (фильтр до)', required: false })
  @IsDateString()
  @IsOptional()
  plannedTo?: string;

  @ApiProperty({ description: 'Показать только просроченные дефекты', required: false })
  @Transform(({ value }) => value === 'true' || value === true)
  @IsOptional()
  overdue?: boolean;

  @ApiProperty({ description: 'Текстовый поиск по заголовку и описанию', required: false })
  @IsString()
  @IsOptional()
  search?: string;
}
