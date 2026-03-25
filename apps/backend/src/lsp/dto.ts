import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CodeDto {
  @IsString()
  @IsNotEmpty()
  code!: string;

  @IsOptional()
  @IsString()
  uri?: string;
}

export class HoverDto extends CodeDto {
  @IsNumber()
  line!: number;

  @IsNumber()
  character!: number;
}

export class CompletionsDto extends CodeDto {
  @IsNumber()
  line!: number;

  @IsNumber()
  character!: number;
}
