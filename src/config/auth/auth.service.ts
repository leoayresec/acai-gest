import { 
    Injectable, 
    BadRequestException, 
    UnauthorizedException, 
    NotFoundException, 
    ForbiddenException 
  } from '@nestjs/common';
  import { JwtService } from '@nestjs/jwt';
  import { PrismaService } from '../../prisma.service';
  import * as bcrypt from 'bcrypt';
  import { randomUUID } from 'crypto';
  import { EmailService } from '../email/email.service';

  @Injectable()
  export class AuthService {
    constructor(
      private readonly prisma: PrismaService,
      private readonly jwtService: JwtService,
      private readonly emailService: EmailService, 
    ) {}
  
    // ✅ Login do usuário (Agora aceita CPF/CNPJ ou e-mail)
    async login(login: string, senha: string) {
      if (!login || !senha) {
        throw new BadRequestException('E-mail/CPF-CNPJ e senha são obrigatórios.');
      }
  
      // 🔍 Buscar usuário pelo email ou CPF/CNPJ
      const usuario = await this.prisma.tab_usuarios.findFirst({
        where: {
          OR: [
            { email: login },
            { tab_empresas: { cpf_cnpj: login } },
          ],
        },
        include: { tab_empresas: true },
      });
  
      if (!usuario) {
        throw new NotFoundException('Nenhuma conta encontrada com este e-mail ou CPF/CNPJ.');
      }
  
      const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
      if (!senhaCorreta) {
        throw new UnauthorizedException('E-mail/CPF-CNPJ ou senha incorretos. Tente novamente.');
      }
  
      // 🔥 Gerar tokens
      const accessToken = this.gerarAccessToken(usuario.id_usuario, usuario.email);
      const refreshToken = this.gerarRefreshToken(usuario.id_usuario);
  
      return {
        message: 'Login realizado com sucesso!',
        accessToken,
        refreshToken,
        usuario: {
          id_usuario: usuario.id_usuario,
          nome: usuario.nome,
          email: usuario.email,
          empresa: usuario.tab_empresas.razao_social,
          cnpj_cpf: usuario.tab_empresas.cpf_cnpj,
        },
      };
    }
  
    // ✅ Gerar Access Token (JWT)
    private gerarAccessToken(id_usuario: string, email: string): string {
      return this.jwtService.sign({ sub: id_usuario, email }, { expiresIn: '15m' });
    }
  
    // ✅ Gerar Refresh Token
    private gerarRefreshToken(id_usuario: string): string {
      return this.jwtService.sign({ sub: id_usuario }, { expiresIn: '7d' });
    }
  
    // ✅ Atualizar Token usando Refresh Token
    async refreshToken(refreshToken: string) {
      try {
        const payload = this.jwtService.verify(refreshToken);
        const usuario = await this.prisma.tab_usuarios.findUnique({
          where: { id_usuario: payload.sub },
        });
  
        if (!usuario) {
          throw new UnauthorizedException('Usuário não encontrado.');
        }
  
        return {
          accessToken: this.gerarAccessToken(usuario.id_usuario, usuario.email),
        };
      } catch (error) {
        throw new ForbiddenException('Refresh Token inválido ou expirado.');
      }
    }
  
    // ✅ Logout (invalida o refresh token)
    async logout(id_usuario: string) {
      return { message: `Usuário ${id_usuario} desconectado com sucesso.` };
    }
  
    // ✅ Solicitar recuperação de senha (gera token e envia e-mail)
    async solicitarRecuperacaoSenha(email: string) {
      if (!email) {
        throw new BadRequestException('E-mail é obrigatório.');
      }
  
      const usuario = await this.prisma.tab_usuarios.findUnique({ where: { email } });
      if (!usuario) {
        throw new NotFoundException('Nenhuma conta encontrada com este e-mail.');
      }
  
      const token = randomUUID();
      const expira_em = new Date();
      expira_em.setHours(expira_em.getHours() + 1); // Token expira em 1 hora
  
      await this.prisma.tab_tokens_verificacao.deleteMany({
        where: { usuario_id: usuario.id_usuario },
      });
  
      await this.prisma.tab_tokens_verificacao.create({
        data: { usuario_id: usuario.id_usuario, token, expira_em },
      });
      
       // 🔥 Chamando a função de envio de e-mail de recuperação
       await this.emailService.sendPasswordRecoveryEmail(email);
      return { message: `E-mail de recuperação enviado para ${email}`, token };
    }
  
    // ✅ Redefinir senha (valida token e atualiza senha)
    async redefinirSenha(token: string, novaSenha: string) {
      if (!token || !novaSenha) {
        throw new BadRequestException('Token e nova senha são obrigatórios.');
      }
  
      const tokenInfo = await this.prisma.tab_tokens_verificacao.findUnique({
        where: { token },
        include: { tab_usuarios: true },
      });
  
      if (!tokenInfo || tokenInfo.expira_em < new Date()) {
        throw new UnauthorizedException('Token inválido ou expirado.');
      }
  
      const novaSenhaCriptografada = await bcrypt.hash(novaSenha, 10);
      await this.prisma.tab_usuarios.update({
        where: { id_usuario: tokenInfo.usuario_id },
        data: { senha: novaSenhaCriptografada },
      });
  
      await this.prisma.tab_tokens_verificacao.delete({ where: { token } });
  
      return { message: 'Senha redefinida com sucesso!' };
    }
  }
  