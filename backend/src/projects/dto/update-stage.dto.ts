import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsDateString, MaxLength } from 'class-validator';

export class UpdateStageDto {
  @ApiProperty({ description: 'Название этапа', maxLength: 255, required: false })
  @IsString()
  @MaxLength(255)
  @IsOptional()
  name?: string;

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
