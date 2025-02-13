import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailConfirmacaoService } from './email_confirmacao.service';
import { EmailConfirmacaoController } from './email_confirmacao.controller';
import { EmailConfirmacao } from './entities/email_confirmacao.entity';
import { EmpresaService } from '../empresa/empresa.service';
import { Empresa } from '../empresa/entities/empresa.entity';
import { EmailModule } from '../config/email/email.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([EmailConfirmacao, Empresa]), 
    EmailModule,
  ],
  controllers: [EmailConfirmacaoController],
  providers: [EmailConfirmacaoService, EmpresaService], 
  exports: [EmailConfirmacaoService],
})
export class EmailConfirmacaoModule {}
