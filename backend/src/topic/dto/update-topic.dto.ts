import { IsString, IsEnum, IsOptional, IsNumber } from 'class-validator';

export class UpdateTopicDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsEnum(['S', 'M', 'L', 'XL'])
  @IsOptional()
  size?: string;

  @IsString()
  @IsEnum(['TODO', 'IN_PROGRESS', 'COMPLETED'])
  @IsOptional()
  status?: string;

  @IsNumber()
  @IsOptional()
  order?: number;

  @IsOptional()
  isPinned?: boolean;
}
