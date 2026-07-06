import { IsString, IsNotEmpty, IsDateString, IsOptional } from 'class-validator';

export class CreateExamDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsDateString()
  @IsNotEmpty()
  deadline: string;

  @IsString()
  @IsOptional()
  color?: string;
}
