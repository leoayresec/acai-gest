import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ✅ Login do usuário (Agora aceita CPF/CNPJ ou e-mail)
  @Post('login')
  async login(@Body('login') login: string, @Body('senha') senhaSha256: string) {
    if (!login || !senhaSha256) {
      throw new BadRequestException('E-mail/CPF-CNPJ e senha são obrigatórios.');
    }

    return this.authService.login(login, senhaSha256);
  }

  // ✅ Solicitação de recuperação de senha
  @Post('recuperar-senha')
  async solicitarRecuperacaoSenha(@Body('email') email: string) {
    if (!email) {
      throw new BadRequestException('E-mail é obrigatório.');
    }

    return this.authService.solicitarRecuperacaoSenha(email);
  }

  // ✅ Redefinir senha usando um token válido
  @Post('redefinir-senha')
  async redefinirSenha(@Body('token') token: string, @Body('novaSenha') novaSenha: string) {
    if (!token || !novaSenha) {
      throw new BadRequestException('Token e nova senha são obrigatórios.');
    }

    return this.authService.redefinirSenha(token, novaSenha);
  }
}
