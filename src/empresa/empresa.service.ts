import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Empresa } from './entities/empresa.entity';
import { CreateEmpresaDto } from './dto/criar-empresa-dto';
import { EmailService } from '../config/email/email.service';
import { EmailConfirmacaoService } from '../email_confirmacao/email_confirmacao.service';

@Injectable()
export class EmpresaService {
  constructor(
    @InjectRepository(Empresa)
    private readonly empresaRepository: Repository<Empresa>,
    private readonly emailService: EmailService, // ✅ Serviço de envio de e-mails
    private readonly emailConfirmacaoService: EmailConfirmacaoService, // ✅ Serviço de tokens
  ) {}

  private async verificarEmailExistente(email: string): Promise<void> {
    const emailExistente = await this.empresaRepository.findOne({ where: { email } });

    if (emailExistente) {
      throw new BadRequestException('O email informado já está em uso.');
    }
  }

  private async criptografarSenha(senha: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(senha, salt);
  }

  async create(createEmpresaDto: CreateEmpresaDto) {
    await this.verificarEmailExistente(createEmpresaDto.email);
    createEmpresaDto.senha = await this.criptografarSenha(createEmpresaDto.senha);

    const empresa = this.empresaRepository.create(createEmpresaDto);
    empresa.ativo = false;

    await this.empresaRepository.save(empresa);

    // ✅ Gerar token na tabela `tab_email_confirmacao`
    const token = await this.emailConfirmacaoService.gerarToken(empresa);

    // ✅ Enviar e-mail de ativação
    await this.emailService.sendConfirmationEmail(createEmpresaDto.email, token);

    return { message: 'Empresa criada! Um e-mail de ativação foi enviado.' };
  }

  async confirmarConta(token: string) {
    const empresa = await this.emailConfirmacaoService.validarToken(token);

    if (!empresa) {
      throw new BadRequestException('Token inválido ou expirado.');
    }

    empresa.ativo = true;
    await this.empresaRepository.save(empresa);

    // ✅ Remover o token da tabela após ativação
    await this.emailConfirmacaoService.removerToken(token);

    return { message: 'Empresa ativada com sucesso!' };
  }

  async buscarPorEmail(email: string): Promise<Empresa | null> {
    return this.empresaRepository.findOne({ where: { email } });
  }
  
  async enviarEmailAtivacao(email: string, token: string) {
    await this.emailService.sendConfirmationEmail(email, token);
  }
    
}
