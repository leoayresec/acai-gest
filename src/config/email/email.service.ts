import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class EmailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly prisma: PrismaService, // ✅ Injetando Prisma
  ) {}

  async sendConfirmationEmail(to: string, token: string) {
    const baseUrl = process.env.APP_URL || 'http://localhost:3000';
    const confirmationUrl = `${baseUrl}/empresa/confirmar?token=${token}`;

    const usuario = await this.prisma.tab_usuarios.findUnique({
      where: { email: to },
      include: { tab_empresas: true },
    });

    if (!usuario) {
      throw new Error(`Usuário com e-mail ${to} não encontrado.`);
    }

    if (!usuario.tab_empresas) {
      throw new Error(`Nenhuma empresa vinculada ao usuário ${usuario.email}.`);
    }

    const nomeEmpresa = usuario.tab_empresas.razao_social;

    await this.mailerService.sendMail({
      to,
      subject: `Confirmação de Cadastro - ${nomeEmpresa}`,
      template: './confirmation',
      context: {
        empresa: nomeEmpresa,
        link: confirmationUrl,
      },
    });

  }
}
