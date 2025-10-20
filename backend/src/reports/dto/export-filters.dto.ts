import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsDateString, IsInt, IsArray } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { DefectStatus, DefectPriority } from '@prisma/client';

export class ExportFiltersDto {
  @ApiProperty({ required: false, enum: DefectStatus })
  @IsEnum(DefectStatus)
  @IsOptional()
  status?: DefectStatus;

  @ApiProperty({ required: false, enum: DefectPriority })
  @IsEnum(DefectPriority)
  @IsOptional()
  priority?: DefectPriority;

  // Support multiple statuses/priorities (e.g., status=new,closed or status[]=new&status[]=closed)
  @ApiProperty({ required: false, enum: DefectStatus, isArray: true })
  @IsArray()
  @IsEnum(DefectStatus, { each: true })
  @Transform(({ value }) => {
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') return value.split(',').map((v) => v.trim());
    return undefined;
  })
  @IsOptional()
  statuses?: DefectStatus[];

  @ApiProperty({ required: false, enum: DefectPriority, isArray: true })
  @IsArray()
  @IsEnum(DefectPriority, { each: true })
  @Transform(({ value }) => {
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') return value.split(',').map((v) => v.trim());
    return undefined;
  })
  @IsOptional()
  priorities?: DefectPriority[];

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
