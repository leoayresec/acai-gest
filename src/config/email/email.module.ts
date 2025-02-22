import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { emailConfig } from './email.config';
import { PrismaService } from '../../prisma.service';

@Module({
  imports: [
    MailerModule.forRoot(emailConfig), // ✅ Importando configuração do e-mail
  ],
  providers: [EmailService, PrismaService],
  exports: [EmailService], // ✅ Permitindo que outros módulos usem o serviço de e-mail
})
export class EmailModule {}
