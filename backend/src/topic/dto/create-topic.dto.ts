import { IsString, IsNotEmpty, IsEnum, IsOptional, IsNumber } from 'class-validator';

export class CreateTopicDto {
  @IsString()
  @IsNotEmpty()
  examId: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsEnum(['S', 'M', 'L', 'XL'])
  size: string;

  @IsNumber()
  @IsOptional()
  order?: number;
}
