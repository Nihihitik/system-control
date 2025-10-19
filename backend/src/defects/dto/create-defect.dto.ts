import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt, IsOptional, IsEnum, IsDateString, MaxLength } from 'class-validator';
import { DefectPriority } from '@prisma/client';

export class CreateDefectDto {
  @ApiProperty({ description: 'Заголовок дефекта', maxLength: 200 })
  @IsString()
  @MaxLength(200)
  title: string;

  @ApiProperty({ description: 'Подробное описание дефекта' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'ID проекта' })
  @IsInt()
  projectId: number;

  @ApiProperty({ description: 'ID объекта строительства' })
  @IsInt()
  buildingObjectId: number;

  @ApiProperty({ description: 'ID этапа работ' })
  @IsInt()
  stageId: number;

  @ApiProperty({
    description: 'Приоритет дефекта',
    enum: DefectPriority,
    default: DefectPriority.medium
  })
  @IsEnum(DefectPriority)
  @IsOptional()
  priority?: DefectPriority;

  @ApiProperty({ description: 'Плановая дата устранения', required: false })
  @IsDateString()
  @IsOptional()
  plannedDate?: string;
}
