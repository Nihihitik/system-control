import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength } from 'class-validator';

export class UpdateObjectDto {
  @ApiProperty({ description: 'Название объекта', maxLength: 255, required: false })
  @IsString()
  @MaxLength(255)
  @IsOptional()
  name?: string;

  @ApiProperty({ description: 'Тип объекта', maxLength: 100, required: false })
  @IsString()
  @MaxLength(100)
  @IsOptional()
  type?: string;

  @ApiProperty({ description: 'Описание объекта', required: false })
  @IsString()
  @IsOptional()
  description?: string;
}
