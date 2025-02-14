import { Controller, Get, Post, Query, Body, BadRequestException } from '@nestjs/common';
import { EmailVerificacaoService } from './email_verificacao.service';

@Controller('email-verificacao')
export class EmailVerificacaoController {
  constructor(private readonly emailVerificacaoService: EmailVerificacaoService) {}

  // ✅ Validar um token
  @Get('validar')
  async validarToken(@Query('token') token: string) {
    try {
      const usuario = await this.emailVerificacaoService.validarToken(token);
      return { message: 'Token válido.', valido: true, usuario };
    } catch (error) {
      return { message: 'Token inválido ou expirado.', valido: false };
    }
  }

  // ✅ Reenviar o e-mail de ativação
  @Post('reenviar')
  async reenviarEmail(@Body('email') email: string) {
    try {
      const usuario = await this.emailVerificacaoService.buscarUsuarioPorEmail(email);

      if (!usuario) {
        throw new BadRequestException('Usuário não encontrado.');
      }

      if (usuario.ativo) {
        return { message: 'Usuário já está ativado.' };
      }

      const token = await this.emailVerificacaoService.gerarToken(usuario.id_usuario);
      await this.emailVerificacaoService.enviarEmailAtivacao(usuario.email, token);

      return { message: 'E-mail de ativação reenviado com sucesso!' };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
