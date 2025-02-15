import { Injectable, BadRequestException } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { PrismaService } from '../../prisma.service';
import { randomUUID } from 'crypto';

@Injectable()
export class EmailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly prisma: PrismaService, // ✅ Injetando Prisma
  ) {}

  // ✅ Enviar e-mail de confirmação de conta
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

  // ✅ Enviar e-mail de recuperação de senha com token
  async sendPasswordRecoveryEmail(to: string) {
    const usuario = await this.prisma.tab_usuarios.findUnique({
      where: { email: to },
      include: { tab_empresas: true },
    });

    if (!usuario) {
      throw new BadRequestException(`Usuário com e-mail ${to} não encontrado.`);
    }

    if (!usuario.tab_empresas) {
      throw new BadRequestException(`Nenhuma empresa vinculada ao usuário ${usuario.email}.`);
    }

    const nomeEmpresa = usuario.tab_empresas.razao_social;
    const token = randomUUID();
    const expira_em = new Date();
    expira_em.setHours(expira_em.getHours() + 1); // 🔥 Token expira em 1 hora

    // 🔥 Remover tokens anteriores do usuário
    await this.prisma.tab_tokens_verificacao.deleteMany({
      where: { usuario_id: usuario.id_usuario },
    });

    // 🔥 Armazenar novo token
    await this.prisma.tab_tokens_verificacao.create({
      data: {
        usuario_id: usuario.id_usuario,
        token,
        expira_em,
      },
    });

    const baseUrl = process.env.APP_URL;
    const resetUrl = `${baseUrl}/auth/redefinir-senha?token=${token}`;

    await this.mailerService.sendMail({
      to,
      subject: `Recuperação de Senha - ${nomeEmpresa}`,
      template: './password-recovery',
      context: {
        empresa: nomeEmpresa,
        link: resetUrl,
      },
    });
  }
}
