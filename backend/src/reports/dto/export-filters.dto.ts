import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsDateString, IsString, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class ExportFiltersDto {
  @ApiProperty({ required: false, enum: ['new', 'in_progress', 'under_review', 'closed', 'cancelled'] })
  @IsEnum(['new', 'in_progress', 'under_review', 'closed', 'cancelled'])
  @IsOptional()
  status?: string;

  @ApiProperty({ required: false, enum: ['critical', 'high', 'medium', 'low'] })
  @IsEnum(['critical', 'high', 'medium', 'low'])
  @IsOptional()
  priority?: string;

  @ApiProperty({ required: false, description: 'Filter by project ID' })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  projectId?: number;

  @ApiProperty({ required: false, description: 'Filter by building object ID' })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  buildingObjectId?: number;

  @ApiProperty({ required: false, description: 'Filter by assignee ID' })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  assigneeId?: number;

  @ApiProperty({ required: false, description: 'Date from (ISO)' })
  @IsDateString()
  @IsOptional()
  dateFrom?: string;

  @ApiProperty({ required: false, description: 'Date to (ISO)' })
  @IsDateString()
  @IsOptional()
  dateTo?: string;
}
