import { Body, Controller, Post } from '@nestjs/common';
import { LspService } from './lsp.service';
import { CodeDto, CompletionsDto, HoverDto } from './dto';

@Controller('lsp')
export class LspController {
  constructor(private readonly lsp: LspService) {}

  @Post('diagnostics')
  diagnostics(@Body() dto: CodeDto) {
    return this.lsp.diagnostics(dto.code, dto.uri);
  }

  @Post('hover')
  hover(@Body() dto: HoverDto) {
    return this.lsp.hover(dto.code, dto.line, dto.character);
  }

  @Post('completions')
  completions(@Body() dto: CompletionsDto) {
    return this.lsp.completions(dto.code, dto.line, dto.character);
  }

  @Post('symbols')
  symbols(@Body() dto: CodeDto) {
    return this.lsp.symbols(dto.code);
  }
}
