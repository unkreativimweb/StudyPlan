import { IsString, IsNotEmpty, IsNumber, IsOptional, IsDateString } from 'class-validator';

export class CreateBlockerDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsNumber()
  @IsOptional()
  dayOfWeek?: number;

  @IsDateString()
  @IsOptional()
  specificDate?: string;

  @IsString()
  @IsNotEmpty()
  startTime: string;

  @IsString()
  @IsNotEmpty()
  endTime: string;
}
