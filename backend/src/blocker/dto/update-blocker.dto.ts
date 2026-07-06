import { IsString, IsNumber, IsOptional, IsDateString } from 'class-validator';

export class UpdateBlockerDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsNumber()
  @IsOptional()
  dayOfWeek?: number;

  @IsDateString()
  @IsOptional()
  specificDate?: string;

  @IsString()
  @IsOptional()
  startTime?: string;

  @IsString()
  @IsOptional()
  endTime?: string;
}
