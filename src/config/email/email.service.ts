import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendConfirmationEmail(to: string, token: string) {
    const confirmationUrl = `https://acai-guest.com/empresa/confirmar?token=${token}`;

    await this.mailerService.sendMail({
      to,
      subject: 'Confirmação de Cadastro - Acai Guest',
      template: './confirmation', // Nome do template de e-mail
      context: {
        confirmationUrl,
      },
    });
  }
}
