import { IsString, IsDateString, IsOptional } from 'class-validator';

export class UpdateExamDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsDateString()
  @IsOptional()
  deadline?: string;

  @IsString()
  @IsOptional()
  color?: string;
}
