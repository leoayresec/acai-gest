import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmpresaService } from './empresa.service';
import { EmpresaController } from './empresa.controller';
import { Empresa } from './entities/empresa.entity';
import { EmailConfirmacaoModule } from '../email_confirmacao/email_confirmacao.module';
import { EmailModule } from '../config/email/email.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Empresa]),
    EmailConfirmacaoModule,
    EmailModule,
  ],
  controllers: [EmpresaController],
  providers: [EmpresaService],
})
export class EmpresaModule {}
