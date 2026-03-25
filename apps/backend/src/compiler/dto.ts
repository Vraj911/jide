import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CompileRunDto {
  @IsString()
  @IsNotEmpty()
  code!: string;
}

export class CompileCheckDto {
  @IsString()
  @IsNotEmpty()
  code!: string;

  @IsOptional()
  @IsBoolean()
  includeAst?: boolean;
}
