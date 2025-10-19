import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, IsDateString, MaxLength } from 'class-validator';

export class CreateStageDto {
  @ApiProperty({ description: 'ID объекта строительства' })
  @IsInt()
  buildingObjectId: number;

  @ApiProperty({ description: 'Название этапа', maxLength: 255 })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiProperty({ description: 'Описание этапа работ', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Плановая дата начала этапа', required: false })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiProperty({ description: 'Плановая дата завершения этапа', required: false })
  @IsDateString()
  @IsOptional()
  endDate?: string;
}
