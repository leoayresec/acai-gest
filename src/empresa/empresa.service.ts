import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { CreateEmpresaDto } from './dto/criar-empresa-dto';
import { EmailService } from '../config/email/email.service';
import { EmailVerificacaoService } from '../email_verificacao/email_verificacao.service';

@Injectable()
export class EmpresaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly emailVerificacaoService: EmailVerificacaoService,
  ) {}

  // ✅ Verifica se o e-mail já existe
  private async verificarEmailExistente(email: string): Promise<boolean> {
    const empresa = await this.prisma.tab_empresas.findUnique({ where: { email } });
    return empresa !== null;
  }
  private async verificarCpfCnpjExistente(cpf_cnpj: string): Promise<boolean> {
    const empresa = await this.prisma.tab_empresas.findUnique({ where: { cpf_cnpj } });
    return empresa !== null;
  }
  // ✅ Criptografa a senha antes de salvar
  private async criptografarSenha(senha: string): Promise<string> {
    return bcrypt.hash(senha, 10);
  }

  // ✅ Criar empresa e enviar e-mail de ativação
  async create(dto: CreateEmpresaDto) {
    if (await this.verificarEmailExistente(dto.email)) {
      throw new BadRequestException('O email informado já está em uso.');
    }

    if (await this.verificarCpfCnpjExistente(dto.cpf_cnpj)) {
      throw new BadRequestException('Já existe uma empresa cadastrada com este CPF/CNPJ.');
    }
  
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
  
      // ✅ Agora criamos o usuário, garantindo que `empresa.id_empresa` está disponível
      const usuario = await this.prisma.tab_usuarios.create({
        data: {
          nome: 'Administrador',
          email: dto.email,
          num_telefone: dto.num_telefone,
          senha: senhaCriptografada,
          ativo: true,
          empresa_id: empresa.id_empresa, // ✅ Agora podemos usar `empresa.id_empresa`
        },
      });
  
      // ✅ Criar token de verificação e enviar e-mail
      const token = await this.emailVerificacaoService.gerarToken(usuario.id_usuario);
      await this.emailService.sendConfirmationEmail(dto.email, token);
  
      return { message: 'Empresa criada! Um e-mail de ativação foi enviado.' };
    } catch (error) {
      console.error('Erro ao criar empresa:', error); // ✅ Exibe detalhes no log
      throw new BadRequestException(error.message || 'Erro ao criar empresa. Verifique os dados e tente novamente.');
    }
    
  }

  // ✅ Confirma a conta ativando a empresa
  async confirmarConta(token: string) {
    const usuario = await this.emailVerificacaoService.validarToken(token);
  
    if (!usuario) {
      throw new BadRequestException('Token inválido ou expirado.');
    }
  
    // ✅ Transação Prisma - Apenas chamadas do Prisma são incluídas
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
  
    // ✅ Agora, chamamos `removerToken` separadamente
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

  // ✅ Buscar empresa pelo ID
  async findOne(id_empresa: string) {
    return this.prisma.tab_empresas.findUnique({ where: { id_empresa } });
  }

  // ✅ Atualizar informações da empresa
  async update(id_empresa: string, data: Partial<CreateEmpresaDto>) {
    return this.prisma.tab_empresas.update({
      where: { id_empresa },
      data,
    });
  }

  // ✅ Remover empresa e usuários relacionados
  async remove(id_empresa: string) {
    return this.prisma.$transaction([
      this.prisma.tab_usuarios.deleteMany({ where: { empresa_id: id_empresa } }),
      this.prisma.tab_empresas.delete({ where: { id_empresa } }),
    ]);
  }
}
