import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import * as bcrypt from 'bcrypt';
import { CreateEmpresaDto } from './dto/criar-empresa-dto';
import { EmailService } from '../config/email/email.service';
import { EmailVerificacaoService } from '../email_verificacao/email_verificacao.service';
import { validate as isUUID } from 'uuid';

@Injectable()
export class EmpresaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly emailVerificacaoService: EmailVerificacaoService,
  ) {}

  // ✅ Verifica se o e-mail já existe
  private async verificarEmailExistente(email: string): Promise<void> {
    const emailExistente = await this.prisma.tab_empresas.findUnique({ where: { email } });

    if (emailExistente) {
      throw new BadRequestException('O email informado já está em uso.');
    }
  }

  // ✅ Criptografa a senha antes de salvar
  private async criptografarSenha(senha: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(senha, salt);
  }

  // ✅ Cria uma nova empresa e envia e-mail de ativação
  async create(dto: CreateEmpresaDto) {
    await this.verificarEmailExistente(dto.email)

    const senhaCriptografada = await this.criptografarSenha(dto.senha);

    try {
      // ✅ Criamos a empresa primeiro
      const empresa = await this.prisma.tab_empresas.create({
        data: {
          razao_social: dto.razao_social,
          email: dto.email,
          num_telefone: dto.num_telefone,
          cpf_cnpj: dto.cpf_cnpj,
          endereco: dto.endereco,
          numero: dto.numero,
          cep: dto.cep,
          senha: senhaCriptografada,
          ativo: false,
        },
      });

      // ✅ Criamos o usuário administrador
      const usuario = await this.prisma.tab_usuarios.create({
        data: {
          nome: 'Administrador',
          email: dto.email,
          num_telefone: dto.num_telefone,
          senha: senhaCriptografada,
          ativo: true,
          empresa_id: empresa.id_empresa,
        },
      });

      // ✅ Criamos o token de verificação e enviamos o e-mail
      const token = await this.emailVerificacaoService.gerarToken(usuario.id_usuario);
      await this.emailService.sendConfirmationEmail(dto.email, token);

      return { message: 'Empresa criada! Um e-mail de ativação foi enviado.' };
    } catch (error) {
      throw new BadRequestException('Erro ao criar empresa. Verifique os dados e tente novamente.');
    }
  }
  // ✅ Confirma a conta ativando a empresa
  async confirmarConta(token: string) {
    const usuario = await this.emailVerificacaoService.validarToken(token);
    if (!usuario) {
      throw new BadRequestException('Token inválido ou expirado.');
    }
    await this.prisma.$transaction([
      this.prisma.tab_empresas.update({
        where: { id_empresa: usuario.empresa_id },
        data: { ativo: true },
      }),
      this.prisma.tab_usuarios.update({
        where: { id_usuario: usuario.id_usuario },
        data: { ativo: true },
      }),
    ]);

    // 🔹 Remove o token fora da transação para evitar erro de `PrismaPromise`
    await this.emailVerificacaoService.removerToken(token);
    return { message: 'Conta ativada com sucesso!' };
  }

  // ✅ Buscar empresa pelo e-mail
  async buscarPorEmail(email: string) {
    return this.prisma.tab_empresas.findUnique({ where: { email } });
  }

  // ✅ Buscar todas as empresas cadastradas
  async findAll() {
    return this.prisma.tab_empresas.findMany();
  }

  // ✅ Buscar empresa pelo ID com validação de UUID
  async findOne(id_empresa: string) {
 
    if (!isUUID(id_empresa)) {
      throw new BadRequestException('ID da empresa inválido.');
    }
    const empresa = await this.prisma.tab_empresas.findUnique({
      where: { id_empresa },
    });
  
    if (!empresa) {
      throw new BadRequestException('Empresa não encontrada.');
    }
 
    return empresa;
  }
  // ✅ Atualizar informações da empresa
  async update(id_empresa: string, data) {
    if (!isUUID(id_empresa)) {
      throw new BadRequestException('ID da empresa inválido.');
    }

    return this.prisma.tab_empresas.update({
      where: { id_empresa },
      data,
    });
  }

  // ✅ Remover empresa
  async remove(id_empresa: string) {
    if (!isUUID(id_empresa)) {
      throw new BadRequestException('ID da empresa inválido.');
    }

    return this.prisma.tab_empresas.delete({
      where: { id_empresa },
    });
  }
}
