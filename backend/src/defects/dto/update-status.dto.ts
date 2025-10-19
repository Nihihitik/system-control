import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, IsOptional } from 'class-validator';
import { DefectStatus } from '@prisma/client';

export class UpdateStatusDto {
  @ApiProperty({
    description: 'Новый статус дефекта',
    enum: DefectStatus
  })
  @IsEnum(DefectStatus)
  status: DefectStatus;

  @ApiProperty({ description: 'Комментарий к изменению статуса', required: false })
  @IsString()
  @IsOptional()
  comment?: string;
}
