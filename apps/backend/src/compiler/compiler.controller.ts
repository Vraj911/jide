import { Body, Controller, Post } from '@nestjs/common';
import { CompilerService } from './compiler.service';
import { CompileCheckDto, CompileRunDto } from './dto';

@Controller('compile')
export class CompilerController {
  constructor(private readonly compiler: CompilerService) {}

  @Post('run')
  async run(@Body() dto: CompileRunDto) {
    return this.compiler.compileAndRun(dto.code);
  }

  @Post('check')
  async check(@Body() dto: CompileCheckDto) {
    return this.compiler.compileOnly(dto.code, { includeAst: dto.includeAst });
  }
}
