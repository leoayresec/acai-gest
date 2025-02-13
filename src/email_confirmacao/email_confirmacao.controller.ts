import { Controller, Get, Post, Query, Body } from '@nestjs/common';
import { EmailConfirmacaoService } from './email_confirmacao.service';
import { EmpresaService } from '../empresa/empresa.service';

@Controller('email-confirmacao')
export class EmailConfirmacaoController {
  constructor(
    private readonly emailConfirmacaoService: EmailConfirmacaoService,
    private readonly empresaService: EmpresaService,
  ) {}

  @Get('validar')
  async validarToken(@Query('token') token: string) {
    const empresa = await this.emailConfirmacaoService.validarToken(token);

    if (!empresa) {
      return { message: 'Token inválido ou expirado.', valido: false };
    }

    return { message: 'Token válido.', valido: true };
  }

  @Post('reenviar')
  async reenviarEmail(@Body('email') email: string) {
    const empresa = await this.empresaService.buscarPorEmail(email);

    if (!empresa) {
      return { message: 'Empresa não encontrada.' };
    }

    if (empresa.ativo) {
      return { message: 'Empresa já está ativada.' };
    }

    const token = await this.emailConfirmacaoService.gerarToken(empresa);
    await this.empresaService.enviarEmailAtivacao(empresa.email, token);

    return { message: 'E-mail de ativação reenviado com sucesso!' };
  }
}
