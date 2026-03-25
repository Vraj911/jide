import { Module } from '@nestjs/common';
import { CompilerController } from './compiler.controller';
import { CompilerService } from './compiler.service';
import { ExecutionService } from './execution.service';

@Module({
  controllers: [CompilerController],
  providers: [CompilerService, ExecutionService],
  exports: [CompilerService],
})
export class CompilerModule {}
