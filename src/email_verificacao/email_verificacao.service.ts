import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { randomUUID } from 'crypto';

@Injectable()
export class EmailVerificacaoService {
  constructor(private readonly prisma: PrismaService) {}

  // ✅ Buscar usuário pelo e-mail
  async buscarUsuarioPorEmail(email: string) {
    return this.prisma.tab_usuarios.findUnique({
      where: { email },
    });
  }

  // ✅ Enviar e-mail de ativação (simulado)
  async enviarEmailAtivacao(email: string, token: string) {
  }

  // ✅ Gerar um token de verificação para ativação de conta
  async gerarToken(id_usuario: string): Promise<string> {
    const token = randomUUID();
    const dtExpiracao = new Date();
    dtExpiracao.setDate(dtExpiracao.getDate() + 1); // Expira em 24h

    await this.prisma.tab_tokens_verificacao.deleteMany({ where: { usuario_id: id_usuario } });

    await this.prisma.tab_tokens_verificacao.create({
      data: { usuario_id: id_usuario, token, expira_em: dtExpiracao },
    });

    return token;
  }

  // ✅ Validar token e retornar os dados do usuário
  async validarToken(token: string) {

    if (!token) {
      throw new BadRequestException('Token não informado.');
    }
  
    const tokenInfo = await this.prisma.tab_tokens_verificacao.findUnique({
      where: { token },
      include: { tab_usuarios: true },
    });
  
    if (!tokenInfo || tokenInfo.expira_em < new Date()) {
      throw new BadRequestException('Token inválido ou expirado.');
    }
      return tokenInfo.tab_usuarios;
  }
  

  // ✅ Remover token após ativação da conta
  async removerToken(token: string) {
    return this.prisma.tab_tokens_verificacao.delete({ where: { token } });
  }
}
