import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { CompilerModule } from './compiler/compiler.module';
import { LspModule } from './lsp/lsp.module';
import { ContributionsModule } from './contributions/contributions.module';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGO_URI || 'mongodb://localhost:27017/jide'),
    AuthModule,
    CompilerModule,
    LspModule,
    ContributionsModule,
  ],
})
export class AppModule {}
