import { Module } from '@nestjs/common';
import { EmailVerificacaoService } from './email_verificacao.service';
import { EmailModule } from '../config/email/email.module';
import { PrismaModule } from '../../prisma/prisma.module'; // ✅ Importa o PrismaModule corretamente

@Module({
  imports: [EmailModule, PrismaModule], // ✅ Agora usamos Prisma
  providers: [EmailVerificacaoService], // 🔹 Removemos serviços desnecessários
  exports: [EmailVerificacaoService], // 🔹 Permite que outros módulos usem este serviço
})
export class EmailVerificacaoModule {}
